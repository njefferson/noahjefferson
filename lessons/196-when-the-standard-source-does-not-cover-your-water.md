## 196 · When the standard source does not cover your water, ask what is measured instead

**Enforced by:** JUDGEMENT — no gate can tell "this dataset does not exist for my area" from "I did not find it", because the session sees the same empty result. · CHECKLIST enumerate-the-standard-source — before concluding a thing is unavailable, fetch the standard source's own station or coverage index and check the extent against your area by coordinate, not by search. · CHECKLIST prediction-versus-measurement — where a forecast is missing, ask separately whether the quantity is MEASURED somewhere; they are different products with different coverage.

**Smell:** "there is no data for this" reached without enumerating a coverage
index. Also: building a forecast out of a measurement series because the
forecast could not be found — a guess wearing the clothes of a reading. Also:
assuming the consumer convention for a question is the only convention.

An app needed to show what the tide does along a tidal river, not at one
station. The standard product for that question is a tidal CURRENT prediction —
slack water and maximum flood and ebb, tabulated per station — and the obvious
conclusion, having seen the app already used the tide-height API, was that the
current predictions would be there too.

**Fetching the index settled it in one request.** 4,430 current-prediction
stations exist; 48 are in the relevant delta; every one of those 48 is
downstream of the reach in question, the furthest upstream being below the
lowest gauge that mattered. Above that point nobody forecasts which way the
water will run, at any time. That is a fact about the coverage, established by
coordinate, not an impression from failing to find something.

**Then the second question, which is the one that pays.** A forecast being
absent says nothing about whether the quantity is MEASURED. It was: the
hydrological service publishes signed water velocity, and — the detail that
made the feature — **six gauges reported it and every one was inside the tidal
reach**. The instrument network existed exactly where the tide did and stopped
where it stopped. The absence of instruments upstream was itself an answer.

**The result is better than the thing originally wanted**, because a
measurement of what the water is doing now beats a prediction of what it should
be doing, and the app could say so honestly. What it must never do is
manufacture the missing forecast out of the measurement it has: the interval
between turns is regular enough that extrapolating looks respectable, and it
would be the app inventing the one product the world declined to publish.

**The general form:** a missing dataset is three different findings — nobody
publishes it, nobody publishes a FORECAST of it but somebody MEASURES it, or
the session failed to look properly. Only the third is about the session, and
only the second is an opportunity. Enumerate the coverage before deciding which
one you are in.
