import React, { useEffect, useMemo } from "react";
import omit from "lodash/omit";

import Grid from "@mui/material/Grid";

import {
    AlgorithmStatus,
    CourseAsJSON,
    StringifiedValues,
} from "@ta/shared/utils";
import { JSONTable, UploadJSON } from "@ta/ui";

import AlgorithmStatusComponent from "../components/AlgorithmStatus";

import { getCourses, uploadCourses } from "../redux/actions";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import {
    makeCoursesSelector,
    makeAlgorithmStatusSelector,
} from "../redux/selectors";

const UploadCourses: React.FC = () => {
    const dispatch = useAppDispatch();
    const coursesSelector = useMemo(makeCoursesSelector, []);
    const courses = useAppSelector((state) => coursesSelector(state));

    const algorithmStatusSelector = useMemo(makeAlgorithmStatusSelector, []);
    const algorithmStatus = useAppSelector(algorithmStatusSelector);

    const handleChange = (courses: CourseAsJSON[]) => {
        dispatch(uploadCourses(courses));
    };

    useEffect(() => {
        dispatch(getCourses());
    }, [dispatch]);

    return (
        <Grid container spacing={4}>
            <Grid item xs={12}>
                <AlgorithmStatusComponent />
            </Grid>
            <Grid item xs={12}>
                <UploadJSON<CourseAsJSON>
                    buttonText="Upload Courses"
                    onUpload={handleChange}
                    disabled={algorithmStatus === AlgorithmStatus.PENDING}
                />
            </Grid>
            <Grid item xs={12}>
                <JSONTable<StringifiedValues<CourseAsJSON>>
                    data={courses.map(
                        (course) =>
                            omit(
                                {
                                    ...course,
                                    credits: course.credits.join("-"),
                                    maxNumberOfStudents:
                                        course.maxNumberOfStudents.toString(),
                                    faculties: course.faculties.join("\n"),
                                },
                                ["_id", "__v", "createdAt", "updatedAt", "id"]
                            ) as unknown as StringifiedValues<CourseAsJSON>
                    )}
                />
            </Grid>
        </Grid>
    );
};

export default UploadCourses;
