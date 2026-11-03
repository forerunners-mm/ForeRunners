# ForeRunners Livelihood & Vocational Learning Center

Bilingual learner portal (Myanmar / English) hosted as a static GitHub Pages folder and connected to Supabase.

## Current architecture
- GitHub Pages: static frontend
- Supabase Auth: email/password sign-up and sign-in
- Supabase Postgres: profiles, courses, modules, lessons, batches, enrollments, progress, quizzes, assignments, submissions and certificates
- Supabase Storage: private bucket `lvc-learning-files`
- Row Level Security: learner data and course content are restricted by enrollment approval

## Supabase project
- Project ref: `fsypwxvenjqujielhtqb`
- Region: `ap-southeast-1`
- URL: `https://fsypwxvenjqujielhtqb.supabase.co`

The browser client uses the project's publishable key in `config.js`. Never place a Supabase secret/service-role key in this folder or any browser code.

## Important first-time admin setup
1. Create your own learner account through the portal after deployment.
2. Verify the email address and sign in once so the `profiles` row is created.
3. In Supabase Dashboard → SQL Editor, run the following one-time command using your own account email:
   ```sql
   update public.profiles p
   set role = 'admin', account_status = 'approved', updated_at = now()
   from auth.users u
   where p.id = u.id and u.email = 'YOUR_ADMIN_EMAIL';
   ```
4. Sign out and sign in again. The Admin Console will then be available.
5. Admins can approve learner accounts and course applications from the portal.

Do not share the SQL editor or project owner access with learners.

## Seed the initial public course catalogue
Run in Supabase SQL Editor:
```sql
insert into public.courses
(title_my,title_en,description_my,description_en,level,sort_order,is_published)
values
('အခြေခံ အသက်မွေးဝမ်းကျောင်း သင်တန်း','Basic Livelihood Course',
 'ဘဝကျွမ်းကျင်မှု၊ အခြေခံအသက်မွေးဝမ်းကျောင်းကျွမ်းကျင်မှုနှင့် ငွေကြေးအသိပညာ။',
 'Life skills, foundational vocational skills and basic financial literacy.',
 'BASIC',1,true),
('အဆင့်မြင့် အသက်မွေးဝမ်းကျောင်း ဖွံ့ဖြိုးရေးသင်တန်း','Advanced Livelihood Development Course',
 'စီးပွားရေးစီမံမှု၊ ဈေးကွက်ချိတ်ဆက်မှုနှင့် ရေရှည်အသက်မွေးဝမ်းကျောင်းဖွံ့ဖြိုးမှု။',
 'Business management, market linkages and sustainable livelihood development.',
 'ADVANCED',2,true)
on conflict do nothing;
```

## Deploy
The repository's existing GitHub Pages workflow deploys the repository root. After this feature branch is reviewed and merged into `main`, the portal path will be:

`https://forerunners-mm.github.io/ForeRunners/livelihood-learning-center/`

Confirm the repository's Pages custom domain/base URL if it is configured differently.

## Quiz implementation status
- Learners can open published quizzes attached to courses for which they have approved or completed enrollment.
- Questions and options are loaded from the public quiz question table; answer keys remain in the non-exposed `private.quiz_answer_keys` schema.
- The browser submits question IDs and selected option indexes to `public.submit_quiz_attempt`. The database calculates the score and pass/fail result.
- Learners cannot directly insert, update or delete quiz-attempt rows or submit their own score.
- A unique index on `lesson_progress(learner_id, lesson_id)` supports reliable lesson-progress upserts.

## Scope and test status
The learner quiz interface and secure scoring RPC are implemented, but full browser testing with a real approved learner and a populated quiz has not yet been completed. The quiz tables currently have no quiz/question/answer-key records. Admin quiz authoring, practical assignment review, certificates, M&E exports and batch capacity controls remain future work. Do not announce untested features as operational.
