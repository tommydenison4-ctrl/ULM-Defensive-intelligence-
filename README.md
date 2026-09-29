# ULM Defensive Intelligence — South Alabama defensive-language fix

- Preserves the prior South Alabama app as `app-base.html`.
- Uses exact charted ULM defensive formation tags first.
- Untagged plays use the supplied ULM/PFF defensive formation crosswalk (TRIO, TOP, DICE, DUO, FLANK, FIST, etc.).
- Offensive formation names are not displayed as ULM formation labels.
- Motion/backfield/protection no longer fall back to PFF offensive notation.
