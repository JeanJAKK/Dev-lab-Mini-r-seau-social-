// Charger les données de l'utilisateur connecté
useEffect(() => {
  const loadUser = async () => {
    try {
      const fetchedUser = await getUser();
      setUser(fetchedUser);

      if (fetchedUser) {
        setCurrentUser(fetchedUser);

        // Récupérer les infos du profil avec avatar
        const { data: profileData } = await supabase
          .from("profiles")
          .select("name, avatar_url")
          .eq("id", fetchedUser.id)
          .single();

        if (profileData) {
          setUserProfile(profileData);
        }
      }
    } catch (err) {
      console.error("Erreur chargement utilisateur:", err);
    }
  };
  loadUser();
}, []);

const displayName =
  userProfile?.name || currentUser?.email?.split("@")[0] || "Utilisateur";
const avatarUrl =
  userProfile?.avatar_url ||
  `https://ui-avatars.com/api/?name=${displayName}&background=random`;

const sanitizeFileName = (name) => {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
};

const handleImageSelect = (e) => {
  const file = e.target.files[0];
  if (file) {
    if (!file.type.startsWith("image/")) {
      setMessage("Veuillez choisir une image valide.");
      return;
    }
    setMessage("");
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);
  }
};

const handleRemoveImage = () => {
  setImageFile(null);
  setImagePreview(null);
};

const handleCreatePost = async (e) => {
  e.preventDefault();
  setMessage("");
  setLoading(true);

  try {
    if (!user) {
      setMessage("Vous devez être connecté pour publier.");
      setLoading(false);
      return;
    }

    if (!imageFile) {
      setMessage("Choisissez une image !");
      setLoading(false);
      return;
    }

    const fileName = sanitizeFileName(`${Date.now()}_${imageFile.name}`);

    const { error: uploadError } = await supabase.storage
      .from("posts_images")
      .upload(fileName, imageFile);

    if (uploadError) {
      setMessage("Erreur Upload : " + uploadError.message);
      setLoading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("posts_images")
      .getPublicUrl(fileName);

    const imageUrl = urlData.publicUrl;

    const { error: insertError } = await supabase.from("posts").insert({
      title,
      content,
      image_url: imageUrl,
      user_id: user.id,
    });

    if (insertError) {
      setMessage("Erreur insertion : " + insertError.message);
      setLoading(false);
      return;
    }

    setMessage(" Post publié avec succès !");
    setTitle("");
    setContent("");
    setImageFile(null);
  } catch (err) {
    console.error(err);
    setMessage("Erreur inattendue");
  } finally {
    setLoading(false);
  }
};
