export async function postsWithLikesAndComments(postsData, commentData, likesData, user) {
  const data = postsData.map((post) => {
    const comments = commentData.filter((com) => com.post_id === post.id);
    const postLikes = likesData.filter((like) => like.post_id === post.id);
    const likesCount = postLikes.length;

    const userLiked = postLikes.some((like) => like.user_id === user.id);

    return {
      ...post,
      likes: likesCount,
      liked: userLiked,
      comments: comments,
    };
  });

  return data;
}