import React, { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { supabase } from "../supabaseClient";

function Suggestions() {

  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [usersName, setUsersName] = useState([]);

  const getUsers = async () => {

    const { data, error } = await supabase
      .from("profiles")
      .select("name")
      .order("name", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    const randomUsers = data
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);

    setUsersName(randomUsers);
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div className={`rounded-2xl! border! shadow-sm! p-4! ${isDark ? "bg-gray-800! border-purple-600! text-gray-100!" : "bg-white! border-gray-300! text-gray-800!"}`}>

      <h3 className="font-semibold! mb-3!">
        Suggestions
      </h3>

      {usersName.map((user, index) => (

        <div
          key={index}
          className="flex! items-center! justify-between! py-2!"
        >

          <div className="flex! items-center! gap-2!">
            

            <span className="text-sm!">
              {user.name?.trim()}
            </span>
          </div>

          {/*jean y mettra un boutton de suivi*/} 

        </div>

      ))}

    </div>
  );
}

export default Suggestions;