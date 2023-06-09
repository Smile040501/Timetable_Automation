import React from "react";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";

import { Class, Interval, Slot } from "@ta/shared/models";
import { WeekDay } from "@ta/shared/utils";

export const SlotDetails: React.FC<{
    classes: [Class, Interval, Slot][];
    weekDay: WeekDay;
}> = ({ classes, weekDay }) => {
    return (
        <Card sx={{ minWidth: 300 }}>
            <CardContent>
                {classes.length === 0 ? (
                    <Typography variant="h4" component="div">
                        {`Select a slot to see its details!`}
                    </Typography>
                ) : (
                    <>
                        <Typography variant="h4" component="div">
                            {`Slot ${
                                classes[0][2].name
                            }, ${weekDay} (${Interval.getString(
                                classes[0][1].startHours,
                                classes[0][1].startMinutes
                            )} - ${Interval.getString(
                                classes[0][1].endHours,
                                classes[0][1].endMinutes
                            )})`}
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        {classes.map(([cls, , slot], idx) => {
                            const room = cls.rooms[cls.slots.indexOf(slot)];
                            return (
                                <React.Fragment key={idx}>
                                    <Typography variant="body1">
                                        {`${cls.course.name}: ${cls.course.courseType}, ${cls.course.lectureType}, ${cls.course.department}`}
                                    </Typography>
                                    <Typography variant="body2">
                                        {`${room.name}, ${room.campus}`}
                                    </Typography>
                                    <Typography variant="body2">
                                        {`${cls.course.faculties
                                            .map((fac) => fac.toString())
                                            .join(", ")}`}
                                    </Typography>
                                    <Divider sx={{ my: 2 }} />
                                </React.Fragment>
                            );
                        })}
                    </>
                )}
            </CardContent>
        </Card>
    );
};
