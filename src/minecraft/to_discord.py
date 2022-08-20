import re

from src.minecraft.data import emojisCode


def to_discord(content: str):
    def replace(match: re.Match):
        if (match := match.group(0)) and (id := next((
            name for name, value in emojisCode.items() if value["str"] == match
        ), None)):
            return f"<:{emojisCode[id]['name']}:{id}>"
        print(match)
        return match

    return re.sub(
        r"[\uf000-\uffff]",
        replace,
        content,
        re.UNICODE,
        flags=re.MULTILINE,
    )
