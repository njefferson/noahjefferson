Q-HUB-49: an open step, one that ended REFUSED or FAILED, draws no time chip, since its Start line belongs to a send that has ended; a resend writes a new Start line and the chip returns (found in step 133).

Not the repository's: the absent chip on an open step is stated by the docstring of stepTimeChips in report.mjs as by design, and the chip returns once a resend writes a new Start line, an event no step can make.
