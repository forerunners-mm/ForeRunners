# Google Apps Script Deployment Guide

## A. Create the database

1. Create a Google Sheet dedicated to the SRHR Learning Myanmar pilot.
2. Give access only to authorized project administrators.
3. Do not place participant names or sensitive information in this Sheet.

## B. Create the Apps Script project

1. In the Sheet, select **Extensions → Apps Script**.
2. Rename the project: `SRHR Learning Myanmar`.
3. Replace the contents of `Code.gs` with the repository's `apps-script/Code.gs`.
4. Select **+ → HTML**, name the file exactly `Index` (without `.html`), and paste `apps-script/Index.html`.
5. Save the project.

## C. Initialize

1. Select `setupProject` in the Apps Script function selector.
2. Click Run and review the authorization request.
3. Confirm that tabs Users, Levels, QuizQuestions, UserProgress, ActivityLog and Settings were created.
4. The setup creates 100 unpublished placeholder levels. Do not delete or rename the column headers.

## D. Add reviewed lesson content

The Levels sheet columns are:

| Column | Field |
|---|---|
| A | LevelID (1–100) |
| B | Stage |
| C | TitleMM |
| D | TitleEN |
| E | DescriptionMM |
| F | DescriptionEN |
| G | ContentMM |
| H | ContentEN |
| I | IsPublished (TRUE only after review) |

QuizQuestions columns:

A QuestionID; B LevelID; C QuestionMM; D QuestionEN; E OptionAMM; F OptionAEN; G OptionBMM; H OptionBEN; I OptionCMM; J OptionCEN; K OptionDMM; L OptionDEN; M CorrectAnswer (A/B/C/D); N ExplanationMM; O ExplanationEN; P IsPublished.

Only publish lessons and quizzes after qualified SRHR review and age-appropriateness checks. Use unique QuestionID values.

## E. Test

1. Keep deployment restricted to authorized testers.
2. Create a dummy anonymous learner account.
3. Add one dummy lesson and at least one reviewed dummy quiz question.
4. Set IsPublished to TRUE for the dummy content.
5. Open the web app, mark the lesson as read and submit the quiz.
6. Confirm the dashboard, pass threshold and sequential lesson rules.
7. Test unpublished lessons, missing quiz questions and incorrect answers.

## F. Deploy as a web app

1. In Apps Script, click **Deploy → New deployment**.
2. Select **Web app** and use a clear description such as `Restricted pilot test`.
3. Choose the execution identity and access scope only after organizational security review. Do not choose broad public access for an unreviewed child-facing pilot.
4. Deploy, copy the web app URL and test it with a restricted account.
5. When code changes, create a new version and update the deployment.

Check current Google Apps Script quotas and access policies before expanding usage.

## G. Current limitations

This is a pilot MVP. The Game Center and AI Learning Companion are informational placeholders, not working features. There is no admin interface, role-based publishing, rate limiting, offline synchronization or production-grade authentication. Browser local storage holds the anonymous session token. Do not use sensitive or identifiable child data until these risks have been reviewed and addressed.
