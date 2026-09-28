"""Shared helpers used across the EduShield AI backend."""
import ast
import json
from typing import Any, List, Optional


def parse_list_field(value: Any) -> Optional[List[str]]:
    """
    Normalise a stored list-of-strings column into a real list.

    Historically these columns were written with Python's ``str(list)``
    (single quotes), which is not valid JSON. This helper accepts:
      * already-decoded lists
      * JSON arrays  -> ["a", "b"]
      * Python reprs -> ['a', 'b']
      * a plain string (returned as a one-element list)
    """
    if value is None:
        return None
    if isinstance(value, (list, tuple)):
        return [str(item) for item in value]
    if not isinstance(value, str):
        return [str(value)]

    text = value.strip()
    if not text:
        return None

    for loader in (json.loads, ast.literal_eval):
        try:
            parsed = loader(text)
        except Exception:
            continue
        if isinstance(parsed, (list, tuple)):
            return [str(item) for item in parsed]
        if isinstance(parsed, str):
            return [parsed]
        if parsed is None:
            return None

    # Not a list at all - treat the raw text as a single entry
    return [text]
