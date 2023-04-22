import Slot from "../../models/slot";
import { WeekDay } from "../../../utils/enums";
import Interval from "../../models/interval";
import { SlotAsJSON } from "../../../utils/interfaces";

const getDefaultSlotsAsJSON = (): SlotAsJSON[] => [
    {
        name: "B1",
        lectureType: "Normal",
        dayTime: [["Monday", { start: "08:00", end: "08:50" }]],
    },
    {
        name: "A",
        lectureType: "Normal",
        dayTime: [
            ["Monday", { start: "09:00", end: "09:50" }],
            ["Tuesday", { start: "17:00", end: "17:50" }],
            ["Wednesday", { start: "09:00", end: "09:50" }],
        ],
    },
    {
        name: "H",
        lectureType: "Normal",
        dayTime: [
            ["Monday", { start: "10:00", end: "10:50" }],
            ["Wednesday", { start: "11:00", end: "11:50" }],
            ["Friday", { start: "08:00", end: "08:50" }],
        ],
    },
    {
        name: "D",
        lectureType: "Normal",
        dayTime: [
            ["Monday", { start: "11:00", end: "11:50" }],
            ["Wednesday", { start: "17:00", end: "17:50" }],
            ["Friday", { start: "10:00", end: "10:50" }],
        ],
    },
    {
        name: "E",
        lectureType: "Normal",
        dayTime: [
            ["Monday", { start: "12:00", end: "12:50" }],
            ["Wednesday", { start: "12:00", end: "12:50" }],
            ["Friday", { start: "12:00", end: "12:50" }],
        ],
    },
    {
        name: "C",
        lectureType: "Normal",
        dayTime: [
            ["Monday", { start: "17:00", end: "17:50" }],
            ["Wednesday", { start: "08:00", end: "08:50" }],
            ["Friday", { start: "09:00", end: "09:50" }],
        ],
    },
    {
        name: "P1",
        lectureType: "Lab",
        dayTime: [["Monday", { start: "14:00", end: "16:45" }]],
    },
    {
        name: "D1",
        lectureType: "Normal",
        dayTime: [["Tuesday", { start: "08:00", end: "08:50" }]],
    },
    {
        name: "F",
        lectureType: "Normal",
        dayTime: [
            ["Tuesday", { start: "09:00", end: "10:15" }],
            ["Thursday", { start: "09:00", end: "10:15" }],
            ["Friday", { start: "17:00", end: "17:50" }],
        ],
    },
    {
        name: "G",
        lectureType: "Normal",
        dayTime: [
            ["Tuesday", { start: "10:30", end: "11:45" }],
            ["Thursday", { start: "10:30", end: "11:45" }],
        ],
    },
    {
        name: "M",
        lectureType: "Normal",
        dayTime: [
            ["Tuesday", { start: "12:00", end: "12:50" }],
            ["Thursday", { start: "12:00", end: "12:50" }],
        ],
    },
    {
        name: "P2",
        lectureType: "Lab",
        dayTime: [["Tuesday", { start: "14:00", end: "16:45" }]],
    },
    {
        name: "B",
        lectureType: "Normal",
        dayTime: [
            ["Wednesday", { start: "10:00", end: "10:50" }],
            ["Thursday", { start: "17:00", end: "17:50" }],
            ["Friday", { start: "11:00", end: "11:50" }],
        ],
    },
    {
        name: "P3",
        lectureType: "Lab",
        dayTime: [["Wednesday", { start: "14:00", end: "16:45" }]],
    },
    {
        name: "A1",
        lectureType: "Normal",
        dayTime: [["Thursday", { start: "08:00", end: "08:50" }]],
    },
    {
        name: "P4",
        lectureType: "Lab",
        dayTime: [["Thursday", { start: "14:00", end: "16:45" }]],
    },
    {
        name: "P5",
        lectureType: "Lab",
        dayTime: [["Friday", { start: "14:00", end: "16:45" }]],
    },
];

export const generateSlots = (
    slotsAsJSON: SlotAsJSON[] = getDefaultSlotsAsJSON()
) => {
    return slotsAsJSON.map((slot, idx) => {
        return new Slot(
            idx,
            slot.name,
            slot.lectureType,
            slot.dayTime.map((dt) => [
                dt[0] as WeekDay,
                new Interval(dt[1].start, dt[1].end),
            ])
        );
    });
};
