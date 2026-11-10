Q-HUB-241: the four dependency branches still stood on the remote after step 65 landed their changes on main; their pull requests close once GitHub sees main carry the changes, and the sweep keeps branches outside the session's prefix; the next plan reads them once (found in step 65 of the plan of 3 November).

Not the repository's: the dependency branches stand on the remote until GitHub closes their pull requests, an event that must come first and that no step can make.
