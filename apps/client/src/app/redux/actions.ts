export {
    updateAlgorithmStatus,
    updateClasses,
    updateData,
    getAlgorithmStatus,
    generateTimetable,
    getTimetableData,
} from "./slices/algorithmData";

export { auth, authCheckState, authLogout } from "./slices/authUser";

export { updateUI } from "./slices/ui";

export {
    getCourses,
    uploadCourses,
    getRooms,
    uploadRooms,
    getSlots,
    uploadSlots,
} from "./slices/uploadedData";
