"""Random Forest ML model for student dropout prediction."""
import os
import json
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple, Optional
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import joblib
import logging

logger = logging.getLogger(__name__)

# Feature names used by the model
FEATURE_NAMES = [
    "age",
    "attendance_percentage",
    "previous_failures",
    "final_grade",
    "study_time_weekly",
    "distance_from_school",
    "gender_encoded",
    "family_support_encoded",
    "internet_access",
    "fee_status_encoded",
    "medical_condition_encoded",
    "higher_education_interest",
]

# Defaults for optional features a caller may omit (e.g. CSV uploads)
FEATURE_DEFAULTS = {
    "age": 15,
    "attendance_percentage": 75.0,
    "previous_failures": 0,
    "final_grade": 55.0,
    "study_time_weekly": 6.0,
    "distance_from_school": 5.0,
    "gender_encoded": 1,
    "family_support_encoded": 1,
    "internet_access": 1,
    "fee_status_encoded": 1,
    "medical_condition_encoded": 0,
    "higher_education_interest": 1,
}

# Defaults for optional raw (pre-encoding) columns
RAW_DEFAULTS = {
    "gender": "male",
    "family_support": "medium",
    "fee_status": "paid",
    "medical_condition": "none",
}

# Risk factor descriptions for explainability
RISK_FACTOR_DESCRIPTIONS = {
    "low_attendance": "Attendance below 75%",
    "previous_failures": "Previous academic failures",
    "low_grade": "Final grade below 40%",
    "no_family_support": "Lack of family support",
    "no_internet": "No internet access",
    "fee_overdue": "Fee payment overdue",
    "medical_condition": "Medical condition affecting studies",
    "low_higher_ed_interest": "Low interest in higher education",
    "long_distance": "Long distance from school",
    "low_study_time": "Less than 5 hours weekly study time",
}


class DropoutPredictor:
    """Random Forest based student dropout prediction model."""

    def __init__(self, model_path: str = None, scaler_path: str = None):
        self.model: Optional[RandomForestClassifier] = None
        self.scaler: Optional[StandardScaler] = None
        self.label_encoders: Dict[str, LabelEncoder] = {}
        self.model_path = model_path or "app/ml/model.pkl"
        self.scaler_path = scaler_path or "app/ml/scaler.pkl"
        self.is_trained = False

    def _encode_categorical(self, df: pd.DataFrame, fit: bool = False) -> pd.DataFrame:
        """Encode categorical features."""
        df = df.copy()

        # Tolerate callers that omit raw categorical columns
        for col, default in RAW_DEFAULTS.items():
            if col not in df.columns:
                df[col] = default

        # Deterministic encodings: these must match the ordering LabelEncoder
        # produced at training time (alphabetical), and must not depend on a
        # persisted encoder object being available after a restart.
        gender_map = {"female": 0, "male": 1, "other": 2}
        df["gender_encoded"] = (
            df["gender"].astype(str).str.lower().map(gender_map).fillna(0).astype(int)
        )

        # Family support encoding
        support_map = {"low": 0, "medium": 1, "high": 2}
        df["family_support_encoded"] = (
            df["family_support"].astype(str).str.lower().map(support_map).fillna(1).astype(int)
        )

        # Fee status encoding
        fee_map = {"overdue": 0, "pending": 1, "scholarship": 2, "paid": 3}
        df["fee_status_encoded"] = (
            df["fee_status"].astype(str).str.lower().map(fee_map).fillna(1).astype(int)
        )

        # Medical condition encoding
        medical_map = {"none": 0, "minor": 1, "chronic": 2, "severe": 3}
        df["medical_condition_encoded"] = (
            df["medical_condition"].astype(str).str.lower().map(medical_map).fillna(0).astype(int)
        )

        # Boolean features may arrive as strings from CSV uploads
        for col in ("internet_access", "higher_education_interest"):
            if col in df.columns:
                if df[col].dtype == object:
                    df[col] = df[col].astype(str).str.lower().isin(["true", "yes", "1"])
                df[col] = df[col].astype(int)

        return df

    def _prepare_features(self, df: pd.DataFrame, fit: bool = False) -> np.ndarray:
        """Prepare feature matrix for model input."""
        df = self._encode_categorical(df, fit=fit)

        # Fill any optional columns a caller (e.g. CSV upload) did not provide
        for col, default in FEATURE_DEFAULTS.items():
            if col not in df.columns:
                df[col] = default

        features = df[FEATURE_NAMES].values

        if fit:
            self.scaler = StandardScaler()
            features = self.scaler.fit_transform(features)
        else:
            if self.scaler is None:
                # No persisted scaler (e.g. first run after a clean install):
                # build a complete model before predicting rather than
                # fitting a scaler on a single sample.
                self._train_with_synthetic_data()
            features = self.scaler.transform(features)

        return features

    def train(self, data: pd.DataFrame) -> Dict[str, float]:
        """
        Train the Random Forest model on student data.

        Args:
            data: DataFrame with student features and 'dropped_out' target column

        Returns:
            Dictionary with training metrics
        """
        logger.info("Starting model training...")

        # Prepare features
        X = self._prepare_features(data, fit=True)
        y = data["dropped_out"].values

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        # Train Random Forest
        self.model = RandomForestClassifier(
            n_estimators=200,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            class_weight="balanced",
            n_jobs=-1,
        )
        self.model.fit(X_train, y_train)

        # Evaluate
        y_pred = self.model.predict(X_test)
        metrics = {
            "accuracy": accuracy_score(y_test, y_pred),
            "precision": precision_score(y_test, y_pred, average="weighted"),
            "recall": recall_score(y_test, y_pred, average="weighted"),
            "f1_score": f1_score(y_test, y_pred, average="weighted"),
        }

        self.is_trained = True
        logger.info(f"Model training complete. Metrics: {metrics}")

        # Save model
        self.save_model()

        return metrics

    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict dropout risk for a single student.

        Args:
            features: Dictionary with student features

        Returns:
            Dictionary with prediction results
        """
        if not self.is_trained:
            self.load_model()

        # Convert to DataFrame
        df = pd.DataFrame([features])

        # Prepare features
        X = self._prepare_features(df, fit=False)

        # Predict
        risk_proba = self.model.predict_proba(X)[0]
        risk_class = self.model.predict(X)[0]

        # Calculate risk percentage (probability of dropping out)
        risk_percentage = float(risk_proba[1]) * 100

        # Determine risk level
        if risk_percentage >= 70:
            risk_level = "high"
        elif risk_percentage >= 40:
            risk_level = "medium"
        else:
            risk_level = "low"

        # Get confidence score (max probability)
        confidence = float(max(risk_proba)) * 100

        # Explainability - get feature importances for this prediction
        risk_factors = self._get_risk_factors(features)

        # Generate recommendations
        recommendations = self._generate_recommendations(risk_factors, risk_level)

        # Suggest intervention
        intervention = self._suggest_intervention(risk_level, risk_factors)

        return {
            "risk_level": risk_level,
            "risk_percentage": round(risk_percentage, 2),
            "confidence_score": round(confidence, 2),
            "risk_factors": risk_factors,
            "recommendations": recommendations,
            "intervention_suggested": intervention,
        }

    def predict_bulk(self, students_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Predict dropout risk for multiple students.

        Args:
            students_data: List of student feature dictionaries

        Returns:
            List of prediction results
        """
        if not self.is_trained:
            self.load_model()

        df = pd.DataFrame(students_data)
        X = self._prepare_features(df, fit=False)

        risk_probas = self.model.predict_proba(X)
        risk_classes = self.model.predict(X)

        results = []
        for i, features in enumerate(students_data):
            risk_percentage = float(risk_probas[i][1]) * 100

            if risk_percentage >= 70:
                risk_level = "high"
            elif risk_percentage >= 40:
                risk_level = "medium"
            else:
                risk_level = "low"

            confidence = float(max(risk_probas[i])) * 100
            risk_factors = self._get_risk_factors(features)
            recommendations = self._generate_recommendations(risk_factors, risk_level)
            intervention = self._suggest_intervention(risk_level, risk_factors)

            results.append({
                "risk_level": risk_level,
                "risk_percentage": round(risk_percentage, 2),
                "confidence_score": round(confidence, 2),
                "risk_factors": risk_factors,
                "recommendations": recommendations,
                "intervention_suggested": intervention,
            })

        return results

    def _get_risk_factors(self, features: Dict[str, Any]) -> List[str]:
        """Identify contributing risk factors for a student."""
        factors = []

        if features.get("attendance_percentage", 100) < 75:
            factors.append(RISK_FACTOR_DESCRIPTIONS["low_attendance"])

        if features.get("previous_failures", 0) > 0:
            factors.append(RISK_FACTOR_DESCRIPTIONS["previous_failures"])

        if features.get("final_grade", 100) < 40:
            factors.append(RISK_FACTOR_DESCRIPTIONS["low_grade"])

        if features.get("family_support") == "low":
            factors.append(RISK_FACTOR_DESCRIPTIONS["no_family_support"])

        if not features.get("internet_access", True):
            factors.append(RISK_FACTOR_DESCRIPTIONS["no_internet"])

        if features.get("fee_status") == "overdue":
            factors.append(RISK_FACTOR_DESCRIPTIONS["fee_overdue"])

        if features.get("medical_condition") in ["chronic", "severe"]:
            factors.append(RISK_FACTOR_DESCRIPTIONS["medical_condition"])

        if not features.get("higher_education_interest", True):
            factors.append(RISK_FACTOR_DESCRIPTIONS["low_higher_ed_interest"])

        if features.get("distance_from_school", 0) > 10:
            factors.append(RISK_FACTOR_DESCRIPTIONS["long_distance"])

        if features.get("study_time_weekly", 0) < 5:
            factors.append(RISK_FACTOR_DESCRIPTIONS["low_study_time"])

        return factors

    def _generate_recommendations(self, risk_factors: List[str], risk_level: str) -> List[str]:
        """Generate AI recommendations based on risk factors."""
        recommendations = []

        if risk_level == "high":
            recommendations.append("Immediate counselling session required")
            recommendations.append("Schedule parent-teacher meeting within 48 hours")

        if RISK_FACTOR_DESCRIPTIONS["low_attendance"] in risk_factors:
            recommendations.append("Implement attendance monitoring and alert system")
            recommendations.append("Identify barriers to regular attendance")

        if RISK_FACTOR_DESCRIPTIONS["previous_failures"] in risk_factors:
            recommendations.append("Provide remedial classes and academic support")
            recommendations.append("Assign peer mentor for struggling subjects")

        if RISK_FACTOR_DESCRIPTIONS["low_grade"] in risk_factors:
            recommendations.append("Conduct learning assessment and create improvement plan")
            recommendations.append("Provide additional study materials and resources")

        if RISK_FACTOR_DESCRIPTIONS["no_family_support"] in risk_factors:
            recommendations.append("Engage with parents/guardians through home visits")
            recommendations.append("Connect family with community support programs")

        if RISK_FACTOR_DESCRIPTIONS["no_internet"] in risk_factors:
            recommendations.append("Provide offline learning materials and resources")
            recommendations.append("Facilitate access to school computer lab")

        if RISK_FACTOR_DESCRIPTIONS["fee_overdue"] in risk_factors:
            recommendations.append("Connect with scholarship and financial aid programs")
            recommendations.append("Explore fee waiver options with school administration")

        if RISK_FACTOR_DESCRIPTIONS["medical_condition"] in risk_factors:
            recommendations.append("Coordinate with school health services")
            recommendations.append("Develop accommodation plan for medical needs")

        if RISK_FACTOR_DESCRIPTIONS["low_higher_ed_interest"] in risk_factors:
            recommendations.append("Provide career counselling and guidance")
            recommendations.append("Organize career exposure visits and workshops")

        if RISK_FACTOR_DESCRIPTIONS["long_distance"] in risk_factors:
            recommendations.append("Explore transportation assistance options")
            recommendations.append("Consider hostel or accommodation support")

        if RISK_FACTOR_DESCRIPTIONS["low_study_time"] in risk_factors:
            recommendations.append("Create structured study schedule")
            recommendations.append("Provide time management training")

        if not recommendations:
            recommendations.append("Continue regular monitoring and support")
            recommendations.append("Maintain current academic performance")

        return recommendations

    def _suggest_intervention(self, risk_level: str, risk_factors: List[str]) -> str:
        """Suggest appropriate intervention based on risk level."""
        if risk_level == "high":
            return "Immediate one-on-one counselling, parent meeting, and academic support plan"
        elif risk_level == "medium":
            return "Schedule counselling session and monitor progress closely"
        else:
            return "Continue regular monitoring and provide guidance as needed"

    def save_model(self):
        """Save the trained model and scaler to disk."""
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        joblib.dump(self.model, self.model_path)
        joblib.dump(self.scaler, self.scaler_path)
        logger.info(f"Model saved to {self.model_path}")

    def load_model(self):
        """Load the trained model and scaler from disk."""
        if os.path.exists(self.model_path) and os.path.exists(self.scaler_path):
            self.model = joblib.load(self.model_path)
            self.scaler = joblib.load(self.scaler_path)
            self.is_trained = True
            logger.info("Model loaded successfully")
        else:
            logger.warning("No trained model found. Training new model...")
            self._train_with_synthetic_data()

    def _train_with_synthetic_data(self):
        """Train model with synthetic data for initial setup."""
        logger.info("Training model with synthetic data...")

        np.random.seed(42)
        n_samples = 1000

        data = pd.DataFrame({
            "age": np.random.randint(14, 22, n_samples),
            "attendance_percentage": np.random.uniform(40, 100, n_samples),
            "previous_failures": np.random.randint(0, 4, n_samples),
            "final_grade": np.random.uniform(20, 95, n_samples),
            "study_time_weekly": np.random.uniform(0, 30, n_samples),
            "distance_from_school": np.random.uniform(0, 30, n_samples),
            "gender": np.random.choice(["male", "female"], n_samples),
            "family_support": np.random.choice(["low", "medium", "high"], n_samples),
            "internet_access": np.random.choice([True, False], n_samples),
            "fee_status": np.random.choice(["paid", "pending", "overdue", "scholarship"], n_samples),
            "medical_condition": np.random.choice(["none", "minor", "chronic", "severe"], n_samples),
            "higher_education_interest": np.random.choice([True, False], n_samples),
        })

        # Create target variable based on features
        dropout_score = (
            (100 - data["attendance_percentage"]) * 0.3 +
            data["previous_failures"] * 10 +
            (100 - data["final_grade"]) * 0.2 +
            (data["family_support"] == "low").astype(int) * 15 +
            (~data["internet_access"]).astype(int) * 10 +
            (data["fee_status"] == "overdue").astype(int) * 10 +
            (data["medical_condition"].isin(["chronic", "severe"])).astype(int) * 10 +
            (~data["higher_education_interest"]).astype(int) * 10 +
            (data["distance_from_school"] > 10).astype(int) * 5 +
            (data["study_time_weekly"] < 5).astype(int) * 10
        )

        data["dropped_out"] = (dropout_score > dropout_score.median()).astype(int)

        self.train(data)


# Global predictor instance
predictor = DropoutPredictor()
