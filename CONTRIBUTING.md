# Contributing

We welcome anyone to make pull requests to add their own channels for
the GDQ break screens. Any contributions can optionally include credit
information for the author of the channel to appear in broadcasts.

Note that having your pull request discussed is not a guarantee it will
be accepted, and being merged is not a guarantee that it will appear on
a stream.

## Requirements

-   Channels must fit inside 1092px x 332px.

-   Channels must legibly show the donation total, either in the
    provided gdqpixel font, or in a font with which GDQ has a license to
    use and is appropriate to the channel being submitted.

-   Donations should result in animations or have some visible effect on
    the channel.

-   If basing a channel off of a game, a reasonable attempt must be made
    to recreate or replicate the look and feel of said game so that it's
    clear or obvious to a casual observer.

## Restrictions

-   No flashing or strobing effects.

-   Use of assets from first-party Nintendo games is strictly
    prohibited.

-   Channels may be rejected for using assets from a game too recently
    developed or still commercially marketed. What constitutes recent or
    commercially marketed is at the discretion of Games Done Quick.

-   Channels that resemble or respond to donations in ways deemed too
    similar to an existing channel may be rejected.

-   Channels that are strictly advertisements will be rejected.

-   Channels may be rejected for any other unspecified reason.

## Philosophy/Approach

Break screen channels are a relatively new addition to GDQ, and are one
of a multitude of ways we intend to engage viewers to interact or donate
during downtime. That said, a lot of thought has gone into the right way
to approach a feature like this, and what is an appropriate or fair way
to present and respond to donations.

By their nature as charity events, Games Done Quick events are always
looking for more ways to encourage donations, however there is a balance
to be struck to avoid applying pressure on people to donate beyond their
means. Incentives, prizes and bid wars remain still the primary means of
encouraging people to donate, and will continue to be so going forward.

In addition, the break screen's primary purpose is not to be content in
and of itself; its main goal is to provide a break between the runs for
people to step back or switch off, and people shouldn't feel a pressure
to engage during these moments without feeling like they're missing out
on something.

As such, our approach to designing break screen channels is
intentionally minimal. Donations can advance an animation, result in
something fun, or even build towards longer-term goals, but they should
still ideally be entertaining and charming without the requirement for
donations.

In particular, it is not considered appropriate for channels to have a
"fail state" or negative consequence for a lack of donations. The
audience should not feel compelled to donate in order to avoid a
particular situation from happening in a channel.

Similarly, a break screen that is uninteresting without donations, or
which doesn't have a clear action that a donation would result in is
unlikely to be accepted. Some events or times of day may see smaller
donation levels or engagement, so channels should be built to still work
as channels regardless of the actual flow of donations.

Channels can react to certain regular milestones or respond to large
donations in a special way, however care should be taken to not have
these happen too often, and to avoid making these reactions inordinately
emphasize large donations/donators.

For example, the Monkey Island channel includes options for dialogue to
play in response to big donations, however all donations still result in
a shooting star and there's regular dialogue that will play regardless
on a random interval.

Channels can react to donation trains or to donations in quick
succession, but it should be in addition to how your channel normally
reacts to donations, and shouldn't be solely what your channel is built
around.

For example, a channel may be built to simulate the look and feel of a
rhythm game, with donations resulting in a note appearing as part of a
randomly generated chart. It may be considered appropriate for a channel
to emphasize a donation train or donations in quick succession as
forming a "combo" and reacting as such, as the basic functionality of
the channel still works even with single donations.

## Important Information for Developers

GDQ's current layout system---Pratchett---runs inside
[NodeCG](https://nodecg.dev/), where all data is stored and synced from
in our graphics, such as donation totals and incoming donations. It is
recommended that developers familiarize themselves with NodeCG before
building a channel.

The preview sandbox in this repository includes a shim that replicates
the behavior of NodeCG locally in a browser page.

The graphics themselves are built using React with hooks. Use of
[use-nodecg](https://npmjs.com/package/use-nodecg) hooks is recommended.

On top of the `useReplicant` hook provided by use-nodecg, we have an
additional `usePreloadedReplicant` hook that will return the current
replicant value if it's already been defined. The only replicants that
are guaranteed to be already defined are the `break-channel`, `total`
and `currentEvent` replicants, so this hook should only be used with
those.

### Locking

Your component will be provided props that contain two functions: a
lock() function and an unlock() function. These allow a channel to
temporarily prevent itself from being changed until it's been unlocked.
This can be useful if there's particular animations that shouldn't be
interrupted by a channel change.

Using this lock will not actually pause channel reward redemptions on
Twitch, but will instead merely delay the switch over until the channel
has unlocked itself. If you need to pause reward redemptions, see the
section on the [break-screen-lock replicant](#hardlock)

### Available Replicants/Messages

The donation total is stored in the "total" Replicant which contains
either a `Total` object (as defined in src/types/tracker.d.ts) or
`null`.

```TypeScript
/*
 * NodeCG
 */
const totalRep = nodecg.Replicant<Total | null>('total', {
	defaultValue: null,
});
totalRep.value;

/*
 * use-nodecg
 */
const [total] = usePreloadedReplicant<Total | null>('total', null);
```

Information about the current event (which includes information about
the charity or cause an event is supporting) is stored in the
"currentEvent" Replicant which contains an `Event` object (as defined in
src/types/tracker.d.ts).

```TypeScript
/*
 * NodeCG
 */
const currentEventRep = nodecg.Replicant<Event>('currentEvent');
currentEventRep.value;

/*
 * use-nodecg
 */
const [currentEvent] = usePreloadedReplicant<Event>('currentEvent');
```

Donations are received through the "donation" message which sends a
`FormattedDonation` object (as defined in src/types/tracker.d.ts).

```TypeScript
/*
 * NodeCG
 */
nodecg.listenFor('donation', (donation: FormattedDonation) => {
	// Do something with 'donation'...
});
// nodecg.unlisten('donation', handler);

/*
 * use-nodecg
 */

useListenFor('donation', (donation: FormattedDonation) => {
	// Do something with 'donation'...
});

// useListenFor hook cleans up listener automatically.
```

Subscriptions are received through the "subscription" message which
sends a `TwitchSubscription` object (as defined in
src/types/tracker.d.ts).

```TypeScript
/*
 * NodeCG
 */
nodecg.listenFor('subscription', (subscription: TwitchSubscription) => {
	// Do something with 'subscription'...
});
// nodecg.unlisten('subscription', handler);

/*
 * use-nodecg
 */
useListenFor('subscription', (subscription: TwitchSubscription) => {
	// Do something with 'subscription'...
});
// useListenFor hook cleans up listener automatically.
```

Chat messages are not directly available to channels or graphics at this
time. This may be revisited later, or a solution provided for specific
channels on a case-by-case basis.

<a name="hardlock"></a>Whether the change channel reward can be redeemed
on Twitch is controlled with the "break-screen-lock" replicant, where a
value of `true` will result in reward redemptions being paused. Some
code may refer to this as a "hard lock" to distinguish it from the
temporary lock.

```TypeScript
/*
 * NodeCG
 */
const hardLockRep = nodecg.Replicant<boolean>('break-screen-lock', {
	defaultValue: false,
});
hardLockRep.value;

/*
 * use-nodecg
 */
const [hardLock, setHardLock] = useReplicant<boolean>('break-screen-lock', false);
```

### Coding Guidelines

-   Channels should be built using TypeScript. This helps to ensure data
    and messages are being handled correctly, and to ease with testing.

-   Channels should avoid using binary files or proprietary formats if
    possible, unless they can be easily previewed and/or diffed. Media
    files are an example that would be allowed.

-   While channels need not _necessarily_ be implemented in React, they
    must at least be wrapped in a React component for use with the rest
    of GDQ's layout system. They would also have to rely on the direct
    use of NodeCG messages or replicants---or a NodeCG wrapper library
    for your choice of framework---to send and receive data.

-   It is recommended to format your code using prettier. The repository
    includes rules for prettier and eslint to match the style of
    existing code in the repository.

### Testing

All channels being submitted should be appropriately tested in the
preview sandbox to ensure they respond correctly and remain stable over
the long term and with various inputs.

### Commit Guidelines

-   gdq-break-channels uses [Conventional
    Commits](https://www.conventionalcommits.org/en/v1.0.0/)
