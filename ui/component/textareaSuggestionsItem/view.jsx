// @flow
import ChannelThumbnail from 'component/channelThumbnail';
import React from 'react';

type Props = {
  claim?: Claim,
  emote?: any,
  uri?: string,
};

export default function TextareaSuggestionsItem(props: Props) {
  const { claim, emote, uri, ...autocompleteProps } = props;

  if (emote) {
    const { name: value, url } = emote;

    return (
      <div {...autocompleteProps}>
        <img className="emote" src={url} />

        <div className="textareaSuggestion__label">
          <span className="textareaSuggestion__title textareaSuggestion__value textareaSuggestion__value--emote">
            {value}
          </span>
        </div>
      </div>
    );
  }

  if (claim) {
    const value = claim.canonical_url.replace('lbry://', '').replace('#', ':');

    return (
      <div {...autocompleteProps}>
        <ChannelThumbnail xsmall uri={uri} />

        <div className="textareaSuggestion__label">
          <span className="textareaSuggestion__title">{(claim.value && claim.value.title) || value}</span>
          <span className="textareaSuggestion__value">{value}</span>
        </div>
      </div>
    );
  }

  return null;
}
