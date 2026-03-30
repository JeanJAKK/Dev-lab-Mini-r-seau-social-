import { postsData } from "./post-profil-infos";
import { CommentsData } from "./all-post-comment";
import { likesData } from "./all-post-likes";
import { getUser } from "../systemeLike/getUser";
import { postsWithLikesAndComments } from "./post-infos";
export const fetchPostsWithLikes = async () => {
  try {
    const user = await getUser();
    const post_data = await postsData();
    const like_data = await likesData();
    const comment_data = await CommentsData();
    const data = postsWithLikesAndComments(
      post_data,
      comment_data,
      like_data,
      user,
    );
    return data;
  } catch (err) {
    console.error(err);
    setMessage("❌ Erreur lors du chargement des posts");
  }
};
