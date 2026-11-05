-- Livelihood Development Journey: seven learner growth stages.
-- Safe additive migration: existing courses, modules, enrollments and lesson history remain intact.

create table if not exists public.livelihood_stages (
  stage_no smallint primary key check (stage_no between 1 and 7),
  slug text not null unique,
  title_my text not null,
  title_en text not null,
  description_my text not null,
  description_en text not null,
  outcome_my text not null,
  outcome_en text not null,
  sort_order smallint not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.livelihood_stages
(stage_no,slug,title_my,title_en,description_my,description_en,outcome_my,outcome_en,sort_order)
values
(1,'self-discovery','မိမိကိုယ်ကို သိရှိနားလည်ခြင်း','Self-Discovery & Assessment','မိမိ၏ ပညာရေး၊ အတွေ့အကြုံ၊ အားသာချက်၊ စိတ်ဝင်စားမှုနှင့် လက်ရှိအသက်မွေးဝမ်းကျောင်းအခြေအနေကို ဆန်းစစ်ပါ။','Explore your education, experience, strengths, interests and current livelihood situation.','မိမိ၏ အားသာချက်၊ လိုအပ်ချက်နှင့် ရည်မှန်းချက်ကို ရှင်းလင်းစွာ ဖော်ပြနိုင်ခြင်း။','Can describe personal strengths, development needs and goals.',1),
(2,'foundation','အခြေခံအရည်အချင်း တည်ဆောက်ခြင်း','Foundation & Life Skills','ဘဝကျွမ်းကျင်မှု၊ ဆက်သွယ်ရေး၊ ပြဿနာဖြေရှင်းမှု၊ ငွေကြေးနှင့် ဒစ်ဂျစ်တယ်အခြေခံများကို တည်ဆောက်ပါ။','Build life skills, communication, problem-solving, financial and digital foundations.','နေ့စဉ်ဘဝနှင့် အလုပ်တွင် အသုံးချနိုင်သော အခြေခံကျွမ်းကျင်မှုများ ရရှိခြင်း။','Demonstrates foundational skills for daily life and work.',2),
(3,'skill-development','ကျွမ်းကျင်မှု ဖွံ့ဖြိုးတည်ဆောက်ခြင်း','Skill Development','မိမိရွေးချယ်ထားသော အသက်မွေးဝမ်းကျောင်း၊ နည်းပညာ သို့မဟုတ် စီးပွားရေးကျွမ်းကျင်မှုကို သင်ယူပါ။','Develop selected vocational, technical or enterprise skills.','ရွေးချယ်ထားသော လုပ်ငန်းနယ်ပယ်တွင် အခြေခံလုပ်ငန်းတာဝန်များကို လုပ်ဆောင်နိုင်ခြင်း။','Can perform foundational tasks in a chosen skill area.',3),
(4,'practical-application','လက်တွေ့အသုံးချခြင်း','Practical Application','လက်တွေ့တာဝန်၊ Project၊ Portfolio နှင့် လုပ်ငန်းခွင်အတွေ့အကြုံမှတစ်ဆင့် သင်ယူထားသည်များကို ပြသပါ။','Demonstrate learning through practical tasks, projects, a portfolio and work experience.','စစ်ဆေးအကဲဖြတ်နိုင်သော လက်တွေ့လုပ်ဆောင်မှု သို့မဟုတ် Portfolio အထောက်အထား ရှိခြင်း။','Has assessable practical work or portfolio evidence.',4),
(5,'income-generation','ဝင်ငွေဖန်တီးခြင်း','Income Generation','အလုပ်အကိုင်၊ ကိုယ်ပိုင်လုပ်ငန်း၊ Freelance သို့မဟုတ် အခြားသင့်တော်သော ဝင်ငွေလမ်းကြောင်းကို စတင်ပါ။','Start a suitable income pathway through employment, self-employment, freelancing or enterprise.','ရွေးချယ်ထားသော ဝင်ငွေလမ်းကြောင်းအတွက် လက်တွေ့စတင်ဆောင်ရွက်ထားခြင်း။','Has taken practical steps into a chosen income pathway.',5),
(6,'growth-stability','တိုးတက်မှုနှင့် တည်ငြိမ်မှု','Growth & Stability','အရည်အသွေး၊ ထုတ်လုပ်နိုင်စွမ်း၊ ငွေကြေးစီမံမှု၊ ဈေးကွက်နှင့် အသက်မွေးဝမ်းကျောင်းခံနိုင်ရည်ကို မြှင့်တင်ပါ။','Improve quality, productivity, financial management, market access and livelihood resilience.','ဝင်ငွေနှင့် လုပ်ငန်းတည်ငြိမ်မှုကို ပိုမိုကောင်းမွန်စေရန် အစီအစဉ်နှင့် လုပ်ဆောင်ချက် ရှိခြင်း။','Has a plan and actions to strengthen income and livelihood stability.',6),
(7,'leadership-sustainability','ဦးဆောင်မှုနှင့် ရေရှည်တည်တံ့မှု','Leadership & Sustainability','အခြားသူများကို မျှဝေကူညီခြင်း၊ အလုပ်အကိုင်ဖန်တီးခြင်းနှင့် People, Profit, Planet ကို ထည့်သွင်းစဉ်းစားသော တာဝန်ယူမှုရှိသည့် တိုးတက်မှုကို ဆောင်ရွက်ပါ။','Contribute through mentoring, job creation and responsible growth that considers People, Profit and Planet.','ရေရှည်တည်တံ့သော ကိုယ်ပိုင်တိုးတက်မှုနှင့် လူမှုအသိုင်းအဝိုင်းအကျိုးပြုမှုကို ပြသနိုင်ခြင်း။','Demonstrates sustainable personal progress and community contribution.',7)
on conflict (stage_no) do update set
 slug=excluded.slug,title_my=excluded.title_my,title_en=excluded.title_en,
 description_my=excluded.description_my,description_en=excluded.description_en,
 outcome_my=excluded.outcome_my,outcome_en=excluded.outcome_en,
 sort_order=excluded.sort_order,is_active=true;

alter table public.modules
  add column if not exists stage_no smallint
  references public.livelihood_stages(stage_no) on delete set null;

-- Map current modules to their most relevant stage without moving or duplicating courses.
update public.modules set stage_no = case id
  when '8ead850e-df1a-4164-bc6c-a8e9b2fe2cf7'::uuid then 1
  when '773d4729-7b61-40e4-849f-2650ec61e9b7'::uuid then 1
  when '4910d3a5-5a50-434a-847c-6fef08269a5b'::uuid then 2
  when '58ff53b2-8b15-4c7a-83c2-44504778b179'::uuid then 2
  when 'e48e369d-5d51-42aa-b490-c7f335770640'::uuid then 2
  when '495cc5c0-239a-43a3-a247-50fadd68670f'::uuid then 3
  when 'bc2d1832-ad70-41e3-b2cf-2eab098677cc'::uuid then 3
  when 'e0fce07c-a899-4e58-9bc9-17aea1acf037'::uuid then 5
  when 'c32eb306-17df-4540-9243-7ae8ced7ba82'::uuid then 5
  when '454b9c23-a2c3-498d-9dce-9af73702bccf'::uuid then 6
  when '1d924239-bc26-4bf6-81fa-521a00cd6d31'::uuid then 6
  when 'd1e9107b-6367-4301-94c8-584933061353'::uuid then 7
  else stage_no end;

create table if not exists public.learner_stage_progress (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.profiles(id) on delete cascade,
  stage_no smallint not null references public.livelihood_stages(stage_no) on delete restrict,
  status text not null default 'in_progress'
    check (status in ('in_progress','submitted','verified','needs_support')),
  evidence_summary text,
  reviewer_feedback text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (learner_id,stage_no),
  check (evidence_summary is null or char_length(evidence_summary) <= 5000),
  check (reviewer_feedback is null or char_length(reviewer_feedback) <= 3000),
  check ((status <> 'submitted') or (evidence_summary is not null and length(trim(evidence_summary)) >= 20)),
  check ((status <> 'verified') or (reviewed_by is not null and reviewed_at is not null))
);

create index if not exists learner_stage_progress_learner_idx
  on public.learner_stage_progress(learner_id,stage_no);
create index if not exists learner_stage_progress_status_idx
  on public.learner_stage_progress(status,updated_at desc);

alter table public.livelihood_stages enable row level security;
alter table public.learner_stage_progress enable row level security;

grant select on public.livelihood_stages to anon, authenticated;
grant select, insert, update on public.learner_stage_progress to authenticated;

drop policy if exists "Public can read active livelihood stages" on public.livelihood_stages;
create policy "Public can read active livelihood stages"
on public.livelihood_stages for select
to anon, authenticated using (is_active = true);

drop policy if exists "Learners and admins can read stage progress" on public.learner_stage_progress;
create policy "Learners and admins can read stage progress"
on public.learner_stage_progress for select
to authenticated
using (learner_id = (select auth.uid()) or (select private.is_admin()));

drop policy if exists "Learners can start their own eligible stage" on public.learner_stage_progress;
create policy "Learners can start their own eligible stage"
on public.learner_stage_progress for insert
to authenticated
with check (
  learner_id = (select auth.uid())
  and status = 'in_progress'
  and reviewed_by is null and reviewed_at is null
  and (stage_no = 1 or exists (
    select 1 from public.learner_stage_progress previous_stage
    where previous_stage.learner_id = (select auth.uid())
      and previous_stage.stage_no = learner_stage_progress.stage_no - 1
      and previous_stage.status = 'verified'
  ))
);

drop policy if exists "Learners can update their own stage evidence" on public.learner_stage_progress;
create policy "Learners can update their own stage evidence"
on public.learner_stage_progress for update
to authenticated
using (learner_id = (select auth.uid()) and status = 'in_progress')
with check (
  learner_id = (select auth.uid())
  and status in ('in_progress','submitted')
  and reviewed_by is null and reviewed_at is null
  and (status <> 'submitted' or (evidence_summary is not null and length(trim(evidence_summary)) >= 20))
);

drop policy if exists "Admins can review learner stage progress" on public.learner_stage_progress;
create policy "Admins can review learner stage progress"
on public.learner_stage_progress for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

comment on table public.livelihood_stages is 'Seven sequential learner development stages; course level remains a separate concept.';
comment on table public.learner_stage_progress is 'Private learner evidence and authorized Admin verification for each livelihood development stage.';
comment on column public.modules.stage_no is 'Optional mapping of an existing learning module to its most relevant livelihood development stage.';
