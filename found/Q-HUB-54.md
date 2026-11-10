Q-HUB-54: the check command passes the main thread's stop hold and its correction hold as the status command does, and its output says those holds are not judged (found in step 138).

Put right already: "NOT JUDGED HERE: the stop and correction holds" in `hook-dispatch.mjs`. The check of a call prints that those holds are not judged.
