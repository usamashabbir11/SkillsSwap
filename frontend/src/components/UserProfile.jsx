import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "./Navbar";
import {
  getUserByIdApi,
  sendSwapRequestApi,
  getSwapDealWithUserApi,
  selectCourseForSwapApi,
  hasPendingSwapRequestApi,
  canAccessCourseApi
} from "../api/userApi";

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  const [user, setUser] = useState(null);
  const [deal, setDeal] = useState(null);
  const [courseSelected, setCourseSelected] = useState(false);
  const [sent, setSent] = useState(false);

  // Phase 8: array of booleans, one per course index
  const [accessList, setAccessList] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const userRes = await getUserByIdApi(id);
        const loadedUser = userRes.data;
        setUser(loadedUser);

        const dealRes = await getSwapDealWithUserApi(id);

        if (dealRes.data) {
          setDeal(dealRes.data);

          const isA =
            dealRes.data.userA === loggedInUser.id &&
            dealRes.data.courseFromB !== null;

          const isB =
            dealRes.data.userB === loggedInUser.id &&
            dealRes.data.courseFromA !== null;

          setCourseSelected(Boolean(isA || isB));
        } else {
          setDeal(null);

          const pendingRes = await hasPendingSwapRequestApi(id);
          setSent(pendingRes.data === true);
        }

        // Phase 8: check access for each course of the visited user
        if (loadedUser.courses?.length) {
          const accessResults = await Promise.all(
            loadedUser.courses.map((_, index) =>
              canAccessCourseApi(id, index)
                .then((res) => res.data?.canAccess === true)
                .catch(() => false)
            )
          );
          setAccessList(accessResults);
        }
      } catch {
        navigate("/users");
      }
    };

    load();
  }, [id, navigate, loggedInUser.id]);

  const sendRequest = async () => {
    await sendSwapRequestApi(id);
    setSent(true);
  };

  const selectCourse = async (courseIndex) => {
    await selectCourseForSwapApi(deal.dealId, courseIndex);

    setDeal((prev) => {
      if (!prev) return prev;

      if (prev.userA === loggedInUser.id) {
        return { ...prev, courseFromB: courseIndex };
      }

      if (prev.userB === loggedInUser.id) {
        return { ...prev, courseFromA: courseIndex };
      }

      return prev;
    });

    setCourseSelected(true);

    // Phase 8: re-check access after course selection
    if (user?.courses?.length) {
      const accessResults = await Promise.all(
        user.courses.map((_, index) =>
          canAccessCourseApi(id, index)
            .then((res) => res.data?.canAccess === true)
            .catch(() => false)
        )
      );
      setAccessList(accessResults);
    }
  };

  if (!user) return null;

  const isSender = deal && deal.userA === loggedInUser.id;
  const isReceiver = deal && deal.userB === loggedInUser.id;

  return (
    <>
      <Navbar />

      <div
        className="h-80 bg-gray-400"
        style={{
          backgroundImage: user.coverImage
            ? `url(http://localhost:5000${user.coverImage})`
            : "none",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      />

      <div className="max-w-5xl mx-auto px-6 -mt-20">
        <div className="bg-white shadow rounded p-6 flex items-center gap-6">
          <img
            src={
              user.profileImage
                ? `http://localhost:5000${user.profileImage}`
                : "https://via.placeholder.com/120"
            }
            className="w-28 h-28 rounded-full object-cover border-4 border-white"
          />

          <div className="flex-1">
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-gray-600">{user.email}</p>
          </div>

          {!deal && (
            <button
              disabled={sent}
              onClick={sendRequest}
              className={`px-4 py-2 rounded text-white ${
                sent
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {sent ? "Request Sent ⏳" : "Request Skill Swap"}
            </button>
          )}

          {deal && isSender && (
            <button
              disabled
              className="px-4 py-2 rounded bg-green-600 text-white"
            >
              Request accepted — you can select a course ✔️
            </button>
          )}

          {deal && isReceiver && (
            <button
              disabled
              className="px-4 py-2 rounded bg-green-600 text-white"
            >
              You accepted the request ✔️
            </button>
          )}
        </div>

        {/* ABOUT + CONTACT */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded p-6">
            <h3 className="font-semibold mb-2">About</h3>
            <p>{user.bio || "No bio added yet."}</p>
          </div>

          <div className="bg-white shadow rounded p-6">
            <h3 className="font-semibold mb-2">Contact</h3>
            <p><strong>Phone:</strong> {user.phone || "Not provided"}</p>
            <p><strong>City:</strong> {user.city || "Not provided"}</p>
          </div>
        </div>

        <div className="mt-10 bg-white shadow rounded p-6">
          <h3 className="text-xl font-semibold mb-4">Courses</h3>

          {user.courses?.length ? (
            <div className="space-y-6">
              {user.courses.map((course, index) => {
                const hasAccess = accessList[index] === true;

                return (
                  <div key={index} className="border rounded p-4">
                    <h4 className="font-semibold text-lg">{course.title}</h4>

                    <p className="text-gray-600 mb-3">
                      Price: ${course.price}
                    </p>

                    {deal && !courseSelected && (
                      <button
                        onClick={() => selectCourse(index)}
                        className="mb-3 bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                      >
                        Select this course for swap
                      </button>
                    )}

                    {courseSelected && (
                      <p className="text-green-600 font-semibold mb-3">
                        Course selected ✔️
                      </p>
                    )}

                    {/* Phase 8: Locked vs Unlocked video */}
                    {hasAccess ? (
                      <video
                        controls
                        className="w-full rounded"
                        src={`http://localhost:5000${course.video}`}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center bg-gray-100 border border-gray-300 rounded w-full py-10 gap-3">
                        <span className="text-5xl">🔒</span>
                        <p className="text-gray-600 font-medium text-sm">
                          Swap or Buy to Unlock
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p>No courses available.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default UserProfile;
