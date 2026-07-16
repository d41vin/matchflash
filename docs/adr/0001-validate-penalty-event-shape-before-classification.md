# Validate penalty event shape before classification

The TxLINE documentation does not establish whether a scored `penalty_outcome` also produces a `goal` action. Before implementing goal or penalty classification, MatchFlash must capture a live or devnet stream sequence and use that observed contract to define deduplication; guessing would risk incorrect scores, Flash Cards, Heat, and prediction settlement.
