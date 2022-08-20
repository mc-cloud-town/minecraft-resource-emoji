import re

from src.minecraft.data import emojisCode


def to_minecraft(content: str):
    def replace(match: re.Match):
        if (id := match.group("id")) and id in emojisCode:
            return emojisCode[id]["str"]

        return match.group(0)

    return re.sub(
        r"(?<!\\)<(?<!\\):[^:]+:(?P<id>\d+)>",
        replace,
        content,
        flags=re.MULTILINE,
    )
