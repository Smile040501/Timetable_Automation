import Slot from "../../models/slot";
import { LectureType, WeekDay } from "../../utils/enums";
import Interval from "../../utils/interval";
import { SlotAsJSON } from "../../../utils/interfaces";

export const generateSlots = (slotsAsJSON: SlotAsJSON[] = []) =>
    slotsAsJSON.length === 0
        ? [
              new Slot(1, "B1", LectureType.Normal, [
                  [WeekDay.Monday, new Interval("08:00", "08:50")],
              ]),
              new Slot(2, "A", LectureType.Normal, [
                  [WeekDay.Monday, new Interval("09:00", "09:50")],
                  [WeekDay.Tuesday, new Interval("17:00", "17:50")],
                  [WeekDay.Wednesday, new Interval("09:00", "09:50")],
              ]),
              new Slot(3, "H", LectureType.Normal, [
                  [WeekDay.Monday, new Interval("10:00", "10:50")],
                  [WeekDay.Wednesday, new Interval("11:00", "11:50")],
                  [WeekDay.Friday, new Interval("08:00", "08:50")],
              ]),
              new Slot(4, "D", LectureType.Normal, [
                  [WeekDay.Monday, new Interval("11:00", "11:50")],
                  [WeekDay.Wednesday, new Interval("17:00", "17:50")],
                  [WeekDay.Friday, new Interval("10:00", "10:50")],
              ]),
              new Slot(5, "E", LectureType.Normal, [
                  [WeekDay.Monday, new Interval("12:00", "12:50")],
                  [WeekDay.Wednesday, new Interval("12:00", "12:50")],
                  [WeekDay.Friday, new Interval("12:00", "12:50")],
              ]),
              new Slot(6, "L", LectureType.Normal, [
                  [WeekDay.Monday, new Interval("14:00", "15:15")],
                  [WeekDay.Friday, new Interval("15:30", "16:45")],
              ]),
              new Slot(7, "K", LectureType.Normal, [
                  [WeekDay.Monday, new Interval("15:30", "16:45")],
                  [WeekDay.Friday, new Interval("14:00", "15:15")],
              ]),
              new Slot(8, "C", LectureType.Normal, [
                  [WeekDay.Monday, new Interval("17:00", "17:50")],
                  [WeekDay.Wednesday, new Interval("08:00", "08:50")],
                  [WeekDay.Friday, new Interval("09:00", "09:50")],
              ]),
              new Slot(9, "P1", LectureType.Lab, [
                  [WeekDay.Monday, new Interval("10:00", "12:50")],
              ]),
              new Slot(10, "P4", LectureType.Lab, [
                  [WeekDay.Monday, new Interval("14:00", "16:45")],
              ]),
              new Slot(11, "D1", LectureType.Normal, [
                  [WeekDay.Tuesday, new Interval("08:00", "08:50")],
              ]),
              new Slot(12, "F", LectureType.Normal, [
                  [WeekDay.Tuesday, new Interval("09:00", "10:15")],
                  [WeekDay.Thursday, new Interval("09:00", "10:15")],
                  [WeekDay.Friday, new Interval("17:00", "17:50")],
              ]),
              new Slot(13, "G", LectureType.Normal, [
                  [WeekDay.Tuesday, new Interval("10:30", "11:45")],
                  [WeekDay.Thursday, new Interval("10:30", "11:45")],
              ]),
              new Slot(14, "M", LectureType.Normal, [
                  [WeekDay.Tuesday, new Interval("12:00", "12:50")],
                  [WeekDay.Thursday, new Interval("12:00", "12:50")],
              ]),
              new Slot(15, "I", LectureType.Normal, [
                  [WeekDay.Tuesday, new Interval("14:00", "15:15")],
                  [WeekDay.Thursday, new Interval("15:30", "16:45")],
              ]),
              new Slot(16, "J", LectureType.Normal, [
                  [WeekDay.Tuesday, new Interval("15:30", "16:45")],
                  [WeekDay.Thursday, new Interval("14:00", "15:15")],
              ]),
              new Slot(17, "P5", LectureType.Lab, [
                  [WeekDay.Tuesday, new Interval("14:00", "16:45")],
              ]),
              new Slot(18, "B", LectureType.Normal, [
                  [WeekDay.Wednesday, new Interval("10:00", "10:50")],
                  [WeekDay.Thursday, new Interval("17:00", "17:50")],
                  [WeekDay.Friday, new Interval("11:00", "11:50")],
              ]),
              new Slot(19, "C1", LectureType.Normal, [
                  [WeekDay.Wednesday, new Interval("14:00", "14:50")],
              ]),
              new Slot(20, "P2", LectureType.Lab, [
                  [WeekDay.Wednesday, new Interval("10:00", "12:50")],
              ]),
              new Slot(21, "A1", LectureType.Normal, [
                  [WeekDay.Thursday, new Interval("08:00", "08:50")],
              ]),
              new Slot(22, "P6", LectureType.Lab, [
                  [WeekDay.Thursday, new Interval("14:00", "16:45")],
              ]),
              new Slot(23, "P3", LectureType.Lab, [
                  [WeekDay.Friday, new Interval("10:00", "12:50")],
              ]),
              new Slot(24, "P7", LectureType.Lab, [
                  [WeekDay.Friday, new Interval("14:00", "16:45")],
              ]),
          ]
        : slotsAsJSON.map((slot, idx) => {
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
