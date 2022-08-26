import { connect } from 'react-redux';
import { doResolveUris } from 'redux/actions/claims';
import {
  selectClaimForUri,
  makeSelectClaimForUri,
  selectClaimIsMine,
  selectFetchingMyChannels,
} from 'redux/selectors/claims';
import {
  selectTopLevelCommentsForUri,
  makeSelectTopLevelTotalPagesForUri,
  selectIsFetchingComments,
  selectIsFetchingCommentsById,
  selectIsFetchingReacts,
  makeSelectTotalCommentsCountForUri,
  selectOthersReacts,
  selectMyReacts,
  selectCommentIdsForUri,
  selectSettingsByChannelId,
  selectPinnedCommentsForUri,
} from 'redux/selectors/comments';
import { doCommentReset, doCommentList, doCommentById, doCommentReactList } from 'redux/actions/comments';
import { selectActiveChannelClaim } from 'redux/selectors/app';
import { getChannelIdFromClaim } from 'util/claim';
import CommentsList from './view';
import { makeSelectClientSetting } from 'redux/selectors/settings';
import * as SETTINGS from 'constants/settings';
import { doSetClientSetting } from 'redux/actions/settings';

const select = (state, props) => {
  const { uri } = props;

  const claim = selectClaimForUri(state, uri);
  const channelId = getChannelIdFromClaim(claim);

  const activeChannelClaim = selectActiveChannelClaim(state);
  const topLevelComments = selectTopLevelCommentsForUri(state, uri);

  const resolvedComments =
    topLevelComments && topLevelComments.length > 0
      ? topLevelComments.filter(({ channel_url }) => makeSelectClaimForUri(channel_url)(state) !== undefined)
      : [];

  return {
    topLevelComments,
    resolvedComments,
    allCommentIds: selectCommentIdsForUri(state, uri),
    pinnedComments: selectPinnedCommentsForUri(state, uri),
    topLevelTotalPages: makeSelectTopLevelTotalPagesForUri(uri)(state),
    totalComments: makeSelectTotalCommentsCountForUri(uri)(state),
    claimId: claim && claim.claim_id,
    channelId,
    claimIsMine: selectClaimIsMine(state, claim),
    isFetchingComments: selectIsFetchingComments(state),
    isFetchingCommentsById: selectIsFetchingCommentsById(state),
    isFetchingReacts: selectIsFetchingReacts(state),
    fetchingChannels: selectFetchingMyChannels(state),
    settingsByChannelId: selectSettingsByChannelId(state),
    myReactsByCommentId: selectMyReacts(state),
    othersReactsById: selectOthersReacts(state),
    activeChannelId: activeChannelClaim && activeChannelClaim.claim_id,
    customCommentServers: makeSelectClientSetting(SETTINGS.CUSTOM_COMMENTS_SERVERS)(state),
    commentServer: makeSelectClientSetting(SETTINGS.CUSTOM_COMMENTS_SERVER_URL)(state),
  };
};

const perform = (dispatch, ownProps) => ({
  fetchTopLevelComments: (uri, parentId, page, pageSize, sortBy) =>
    dispatch(doCommentList(uri, parentId, page, pageSize, sortBy)),
  fetchComment: (commentId) => dispatch(doCommentById(commentId)),
  fetchReacts: (commentIds) => dispatch(doCommentReactList(commentIds)),
  resetComments: (claimId) => dispatch(doCommentReset(claimId)),
  doResolveUris: (uris, returnCachedClaims) => dispatch(doResolveUris(uris, returnCachedClaims)),
  setCommentServer: (url) => dispatch(doSetClientSetting(SETTINGS.CUSTOM_COMMENTS_SERVER_URL, url, true)),
});

export default connect(select, perform)(CommentsList);
