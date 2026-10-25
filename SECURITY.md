# Security policy

esp-labs-web is a static site: it has no server, no accounts and stores nothing outside your browser. A security problem here most likely means a way to run script in the guide (for example through a lesson, a translation or a `?lang=` link), a leaked secret, or a compromised dependency.

## Report a vulnerability

Please report it privately through [GitHub's private vulnerability reporting](https://github.com/agharsallah/esp-labs-web/security/advisories/new), not in a public issue or pull request. Include the link or the steps that show the problem and what an attacker could do with it.

You can expect a first answer within a week. Once a fix is out, the advisory is published and you are credited unless you'd rather not be.

## Supported versions

Only the live guide at <https://esp-labs-web.vercel.app>, built from `main`, is supported.

A problem in the firmware that runs on the board belongs to [esp-labs](https://github.com/agharsallah/esp-labs/security).
