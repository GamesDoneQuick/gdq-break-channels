# Contributing

We welcome anyone to make pull requests to add their own channels for the GDQ break screens. Any contributions can optionally include credit information for the author of the channel to appear in broadcasts.

Note that having your pull request discussed is not a guarantee it will be accepted, and being merged is not a guarantee that it will appear on a stream.

## Requirements

- Channels must fit inside 1092px x 332px.

- Channels must legibly show the donation total, either in the provided gdqpixel font, or in a font with which GDQ has a license to use and is appropriate to the channel being submitted.

- Donations should result in animations or have some visible effect on the channel.

- If basing a channel off of a game, a reasonable attempt must be made to recreate or replicate the look and feel of said game so that it's clear or obvious to a casual observer.

## Restrictions

- No flashing or strobing effects.

- Use of assets from first-party Nintendo games is strictly prohibited.

- Channels may be rejected for using assets from a game too recently developed or still commercially marketed. What constitutes recent or commercially marketed is at the discretion of Games Done Quick.

- Channels that resemble or respond to donations in ways deemed too similar to an existing channel may be rejected.

- Channels that are strictly advertisements will be rejected.

- Channels may be rejected for any other unspecified reason.

## Philosophy/Approach

Break screen channels are a relatively new addition to GDQ, and are one of a multitude of ways we intend to engage viewers to interact or donate during downtime. That said, a lot of thought has gone into the right way to approach a feature like this, and what is an appropriate or fair way to present and respond to donations.

By their nature as charity events, Games Done Quick events are always looking for more ways to encourage donations, however there is a balance to be struck to avoid applying pressure on people to donate beyond their means. Incentives, prizes and bid wars remain still the primary means of encouraging people to donate, and will continue to be so going forward.

In addition, the break screen's primary purpose is not to be content in and of itself; it's main goal is to provide a break between the runs for people to step back or switch off, and people shouldn't feel a pressure to engage during these moments without feeling like they're missing out on something.

As such, our approach to designing break screen channels is intentionally minimal. Donations can advance an animation, result in something fun, or even build towards longer-term goals, but they should still ideally be entertaining and charming without the requirement for donations.

In particular, it is not considered appropriate for channels to have a "fail state" or negative consequence for a lack of donations. The audience should not feel compelled to donate in order to avoid a particular situation from happening in a channel.

Similarly, a break screen that is uninteresting without donations, or which doesn't have a clear action that a donation would result in is unlikely to be accepted. Some events or times of day may see smaller donation levels or engagement, so channels should be built to still work as channels regardless of the actual flow of donations.

## Important Information for Developers

GDQ's current layout system—Pratchett—runs inside [NodeCG](https://nodecg.dev/), where all data is stored and synced from in our graphics, such as donation totals and incoming donations. It is recommended that developers familiarize themselves with NodeCG before building a channel.

The preview sandbox in this repository includes a shim that replicates the behavior of NodeCG locally in a browser page.

The graphics themselves are built using React with hooks. Use of [use-nodecg](https://npmjs.com/package/use-nodecg) hooks is recommended.

## Coding Guidelines

- Channels should be built using TypeScript. This helps to ensure data and messages are being handled correctly, and to ease with testing.

- Channels should avoid using binary files or proprietary formats if possible, unless they can be easily previewed and/or diffed. Media files are an example that would be allowed.

- While channels need not *necessarily* be implemented in React, they must at least be wrapped in a React component for use with the rest of GDQ's layout system. They would also have to rely on the direct use of NodeCG messages or replicants—or a NodeCG wrapper library for your choice of framework—to send and receive data.

- It is recommended to format your code using prettier. The repository includes rules for prettier and eslint to match the style of existing code in the repository.

## Testing

All channels being submitted should be appropriately tested in the preview sandbox to ensure they respond correctly and remain stable over the long term and with various inputs.

## Commit Guidelines

- gdq-break-channels uses [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)