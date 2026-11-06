-- Integration tests run after applying the real trainer assignment migrations.
\set ON_ERROR_STOP on

begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000011', true);

select public.test_assert(
  (select count(*) = 1 from public.livelihood_stage_trainers),
  'approved Trainer sees only their own stage assignment'
);
select public.test_assert(
  (select count(*) = 0 from public.learner_stage_progress),
  'Trainer cannot read learner_stage_progress evidence directly'
);
select public.test_assert(
  (select count(*) = 1 from public.livelihood_activity_submissions),
  'Trainer sees only submissions in their assigned stage'
);

update public.livelihood_activity_submissions
set status = 'approved',
    score = 88,
    reviewer_feedback = 'Good practical evidence',
    reviewed_by = auth.uid(),
    reviewed_at = now()
where id = '20000000-0000-0000-0000-000000000001';
select public.test_assert(
  (select status = 'approved' and score = 88
   from public.livelihood_activity_submissions
   where id = '20000000-0000-0000-0000-000000000001'),
  'assigned Trainer can update permitted review fields'
);

-- Column-level grants must prevent changing learner/evidence ownership.
select public.test_assert(
  not has_column_privilege(
    current_user,
    'public.livelihood_activity_submissions',
    'learner_id',
    'UPDATE'
  ),
  'Trainer cannot update learner ownership or evidence columns'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000012', true);
select public.test_assert(
  (select count(*) = 1 from public.livelihood_activity_submissions),
  'second Trainer sees only their different assigned stage'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000013', true);
select public.test_assert(
  (select count(*) = 0 from public.livelihood_stage_trainers),
  'pending Trainer cannot read stage assignments'
);
select public.test_assert(
  (select count(*) = 0 from public.livelihood_activity_submissions),
  'pending Trainer cannot read activity submissions'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
select public.test_assert(
  (select count(*) = 3 from public.livelihood_stage_trainers),
  'Admin can see all stage assignments'
);
select public.test_assert(
  (select count(*) = 2 from public.livelihood_activity_submissions),
  'Admin can see all activity submissions'
);

rollback;
