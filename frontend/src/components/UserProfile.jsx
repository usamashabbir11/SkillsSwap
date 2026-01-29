import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "./Navbar";
import {
  getUserByIdApi,
  sendSwapRequestApi,
  getSwapDealWithUserApi,
  selectCourseForSwapApi,
  hasPendingSwapRequestApi
} from "../api/userApi";

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  const [user, setUser] = useState(null);
  const [deal, setDeal] = useState(null);
  const [courseSelected, setCourseSelected] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const userRes = await getUserByIdApi(id);
        setUser(userRes.data);

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
    setCourseSelected(true);
  };

  if (!user) return null;

  const isSender = deal && deal.userA === loggedInUser.id;
  const isReceiver = deal && deal.userB === loggedInUser.id;

  return (
    <>
      <Navbar />

      {/* COVER */}
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
        {/* HEADER */}
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

        {/* COURSES */}
        <div className="mt-10 bg-white shadow rounded p-6">
          <h3 className="text-xl font-semibold mb-4">Courses</h3>

          {user.courses?.length ? (
            <div className="space-y-6">
              {user.courses.map((course, index) => (
                <div key={index}>
                  <h4 className="font-semibold">{course.title}</h4>

                  {/* ✅ PRICE RESTORED */}
                  <p className="text-gray-600 mb-2">
                    Price: ${course.price}
                  </p>

                  {deal && !courseSelected && (
                    <button
                      onClick={() => selectCourse(index)}
                      className="mb-2 bg-green-600 text-white px-4 py-1 rounded"
                    >
                      Select this course for swap
                    </button>
                  )}

                  {courseSelected && (
                    <p className="text-green-600 font-semibold mb-2">
                      Course selected ✔️
                    </p>
                  )}

                  <video
                    controls
                    className="w-full rounded"
                    src={`http://localhost:5000${course.video}`}
                  />
                </div>
              ))}
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
