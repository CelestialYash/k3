"""Provider-independent LLM abstraction layer."""
from dataclasses import dataclass
from typing import Optional

from app.config import GEMINI_API_KEY, LLM_PROVIDER


@dataclass
class LLMResult:
    configured: bool
    provider: str
    content: str
    error: Optional[str] = None


def generate_grounded_response(system_prompt: str, user_prompt: str) -> LLMResult:
    """Call the configured LLM provider. Never fabricates responses if unconfigured."""
    if LLM_PROVIDER == "gemini" and GEMINI_API_KEY:
        try:
            import google.generativeai as genai
            genai.configure(api_key=GEMINI_API_KEY)
            model = genai.GenerativeModel(
                model_name="gemini-2.0-flash",
                system_instruction=system_prompt,
            )
            resp = model.generate_content(user_prompt)
            return LLMResult(
                configured=True,
                provider="gemini",
                content=resp.text or "",
            )
        except Exception as exc:
            return LLMResult(
                configured=True,
                provider="gemini",
                content="",
                error=str(exc),
            )

    return LLMResult(
        configured=False,
        provider=LLM_PROVIDER,
        content="",
        error="GEMINI_API_KEY is not configured.",
    )
