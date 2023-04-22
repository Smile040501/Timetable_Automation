import Room from "../../models/room";
import { LectureType } from "../../utils/enums";
import { RoomAsJSON } from "../../../utils/interfaces";

const roomsAsTXT = [
    "A 112",
    "A 119",
    "A 120",
    "A 18",
    "A 33",
    "A Aud",
    "A Lab1",
    "A Lab2",
    "A Lab3",
    "A MBA 112",
    "A MBA 113",
    "A MBA 201",
    "A MBA 211",
    "N 204",
    "N 301",
    "N 303",
    "N 305",
    "N 306",
    "N 307",
    "N 308",
    "N Lab4",
    "N Aud Anx",
    "N Lab5",
    "N Lab6",
    "N Lab7",
    "N Lab8",
];

export const roomCapacities = [60, 100];

const getDefaultRoomsAsJSON = () => {
    const rooms: RoomAsJSON[] = [];
    for (let i = 0; i < roomsAsTXT.length; ++i) {
        const roomName = roomsAsTXT[i];
        const lectureType = roomName.includes("Lab")
            ? LectureType.Lab
            : LectureType.Normal;
        const capacity = roomName.includes("Lab")
            ? roomCapacities[roomCapacities.length - 1]
            : roomCapacities[0];
        const campus = roomName[0] === "A" ? "Ahalia" : "Nila";
        rooms.push({
            name: roomName,
            lectureType,
            capacity,
            campus,
        });
    }
    return rooms;
};

export const generateRooms = (
    roomsAsJSON: RoomAsJSON[] = getDefaultRoomsAsJSON()
) => {
    return roomsAsJSON.map(
        (roomInfo, roomIdx) =>
            new Room(
                roomIdx,
                roomInfo.name,
                roomInfo.lectureType,
                roomInfo.capacity,
                roomInfo.campus
            )
    );
};
