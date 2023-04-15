import React, { useMemo } from "react";

import Grid from "@mui/material/Grid";

import JSONTable from "../components/JSONTable";
import UploadJSON from "../components/UploadJSON";
import { uploadCourses } from "../redux/actions";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { makeCoursesSelector } from "../redux/selectors";
import { CourseAsJSON, StringifiedValues } from "../interfaces";

const UploadCourses: React.FC = () => {
    const dispatch = useAppDispatch();
    const coursesSelector = useMemo(makeCoursesSelector, []);
    const courses = useAppSelector((state) => coursesSelector(state));

    const handleChange = (courses: CourseAsJSON[]) => {
        dispatch(uploadCourses(courses));
    };

    return (
        <Grid container spacing={4}>
            <Grid item xs={12}>
                <UploadJSON<CourseAsJSON>
                    buttonText="Upload Courses"
                    onUpload={handleChange}
                />
            </Grid>
            <Grid item xs={12}>
                <JSONTable<StringifiedValues<CourseAsJSON>>
                    data={courses.map((course) => ({
                        ...course,
                        credits: course.credits.join("-"),
                        maxNumberOfStudents:
                            course.maxNumberOfStudents.toString(),
                        faculties: course.faculties.join("\n"),
                    }))}
                />
            </Grid>
        </Grid>
    );
};

export default UploadCourses;
