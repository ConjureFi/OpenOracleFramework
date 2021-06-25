# Conjure
[![Twitter Follow](https://img.shields.io/twitter/follow/ConjureFi?label=Conjure.Finance&style=social)](https://twitter.com/ConjureFi/)
CURRENTLY IN ALPHA WIP // DOCS SOON TO FOLLOW

Permissionless, flexible and robust framework for Oracle deployment with multifeed support, subscriptions and instant deployment.

What is Open Oracle Framework (OOF)?
Open Oracle Framework’s a framework for permissionless oracle deployment and robust and flexible on-chain oracle feeds. Oracles are simply multi-party median value feeds, but you can even implement your own price logic through a dedicated proxy owner, which itself has it’s own price logic. The median value model takes the value for n signers, uses the median value submitted, makes sure that m signers for the m/n threshold has been met and returns the value. The oracle can require a small fee for subscriptions to feeds to cover gas fees, and are able to provide many feeds from 1 contract, allowing for highly efficient feed submission and retrieval. Oracles can set at the feed level if feeds are public, per feed subscription based (with unique pricing) or subscription pass based, allowing for adaptive models for revenue and use cases.
