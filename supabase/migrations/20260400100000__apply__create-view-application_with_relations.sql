DROP VIEW IF EXISTS apply.application_with_relations;

CREATE OR REPLACE VIEW apply.application_with_relations
WITH (security_invoker = on)
AS
SELECT
  a.*,
  jsonb_build_object(
    'staff', to_jsonb(author_ms),
    'options', to_jsonb(author_opt)
  ) AS author,
  to_jsonb(dept_md)   AS department,
  to_jsonb(app_fm)    AS apply_form,
  to_jsonb(status_ms) AS status,

  COALESCE(revs.revisions, '[]'::jsonb) AS application_revisions,
  COALESCE(ords.orders, '[]'::jsonb)    AS approval_orders
  -- COALESCE(revws.viewers, '[]'::jsonb) AS approval_viewers

FROM apply.applications a
LEFT JOIN common.master_staffs      author_ms ON author_ms.id = a.author_id
LEFT JOIN apply.master_staff_options author_opt ON author_opt.staff_id = author_ms.id
LEFT JOIN common.master_departments dept_md   ON dept_md.id   = a.department_id
LEFT JOIN apply.master_status       status_ms ON status_ms.id = a.status_id
LEFT JOIN apply.apply_forms         app_fm    ON app_fm.id    = a.apply_form_id

-- =========================================================
-- revisions 1:N + payload staff expansion + revision attachments
-- =========================================================
LEFT JOIN LATERAL (
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', re.id,
      'application_id', re.application_id,
      'payload',
        (
          re.payload
          || CASE
              WHEN target_ms.id IS NOT NULL
                THEN jsonb_build_object('target_user', to_jsonb(target_ms))
              ELSE '{}'::jsonb
            END
          || CASE
              WHEN primary_ms.id IS NOT NULL
                THEN jsonb_build_object('primary_evaluator', to_jsonb(primary_ms))
              ELSE '{}'::jsonb
            END
          || CASE
              WHEN secondary_ms.id IS NOT NULL
                THEN jsonb_build_object('secondary_evaluator', to_jsonb(secondary_ms))
              ELSE '{}'::jsonb
            END
          || jsonb_build_object('revision_attachments', COALESCE(att.attachments, '[]'::jsonb))
        ),
      'revision_no', re.revision_no,
      'submitted_at', re.submitted_at,
      'creater', to_jsonb(revision_ms),
      'created_by', re.created_by,
      'created_at', re.created_at,

      -- revisions -> attachments[]
      'attachments', COALESCE(att.attachments, '[]'::jsonb)
    )
    ORDER BY re.revision_no
  ) AS revisions
  FROM apply.application_revisions re
  LEFT JOIN common.master_staffs revision_ms ON revision_ms.id = re.created_by

  -- payload target_user_id
  LEFT JOIN common.master_staffs target_ms
    ON target_ms.id = CASE
      WHEN (re.payload->>'target_user_id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      THEN (re.payload->>'target_user_id')::uuid
      ELSE NULL
    END

  -- payload primary_evaluator_id
  LEFT JOIN common.master_staffs primary_ms
    ON primary_ms.id = CASE
      WHEN (re.payload->>'primary_evaluator_id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      THEN (re.payload->>'primary_evaluator_id')::uuid
      ELSE NULL
    END

  -- payload secondary_evaluator_id
  LEFT JOIN common.master_staffs secondary_ms
    ON secondary_ms.id = CASE
      WHEN (re.payload->>'secondary_evaluator_id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      THEN (re.payload->>'secondary_evaluator_id')::uuid
      ELSE NULL
    END

  -- revision attachments
  LEFT JOIN LATERAL (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', ara.id,
        'application_revision_id', ara.application_revision_id,
        'attachment_id', ara.attachment_id,
        'label', ara.label,
        'sort_order', ara.sort_order,
        'created_at', ara.created_at,

        'attachment', jsonb_build_object(
          'id', at.id,
          'sha256', at.sha256,
          'storage_key', at.storage_key,
          'filename', at.filename,
          'content_type', at.content_type,
          'byte_size', at.byte_size,
          'thumbnail_key', at.thumbnail_key,
          'thumbnail_type', at.thumbnail_type,
          'thumbnail_size', at.thumbnail_size,
          'uploaded_by', to_jsonb(uploader_ms),
          'uploaded_at', at.uploaded_at
        )
      )
      ORDER BY ara.sort_order NULLS LAST, ara.created_at
    ) AS attachments
    FROM apply.application_revision_attachments ara
    JOIN apply.attachments at ON at.id = ara.attachment_id
    LEFT JOIN common.master_staffs uploader_ms ON uploader_ms.id = at.uploaded_by
    WHERE ara.application_revision_id = re.id
  ) att ON TRUE

  WHERE re.application_id = a.id
) revs ON TRUE

-- =========================================================
-- approval_orders 1:N + actions + action attachments
-- =========================================================
LEFT JOIN LATERAL (
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', o.id,
      'application_id', o.application_id,
      'approver_user_id', o.approver_user_id,
      'approver_user', to_jsonb(approver_ms),
      'sequence', o.sequence,
      'status_id', o.status_id,
      'status', to_jsonb(order_status_ms),
      'created_at', o.created_at,
      'updated_at', o.updated_at,
      'actions', COALESCE(act.actions, '[]'::jsonb)
    )
    ORDER BY o.sequence
  ) AS orders
  FROM apply.approval_orders o
  LEFT JOIN common.master_staffs approver_ms    ON approver_ms.id = o.approver_user_id
  LEFT JOIN apply.master_status order_status_ms ON order_status_ms.id = o.status_id

  -- actions for each order
  LEFT JOIN LATERAL (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', aa.id,
        'application_id', aa.application_id,
        'action', aa.action,
        'actor_user_id', aa.actor_user_id,
        'actor_user', to_jsonb(actor_ms),
        'order_id', aa.order_id,
        'comment', aa.comment,
        'action_at', aa.action_at,
        'attachments', COALESCE(aatt.attachments, '[]'::jsonb)
      )
      ORDER BY aa.action_at
    ) AS actions
    FROM apply.approval_actions aa
    LEFT JOIN common.master_staffs actor_ms ON actor_ms.id = aa.actor_user_id

    -- action attachments
    LEFT JOIN LATERAL (
      SELECT jsonb_agg(
        jsonb_build_object(
          'approval_action_id', aaa.approval_action_id,
          'attachment_id', aaa.attachment_id,
          'added_by', to_jsonb(added_ms),
          'added_at', aaa.added_at,

          'attachment', jsonb_build_object(
            'id', at.id,
            'sha256', at.sha256,
            'storage_key', at.storage_key,
            'filename', at.filename,
            'content_type', at.content_type,
            'byte_size', at.byte_size,
            'thumbnail_key', at.thumbnail_key,
            'thumbnail_type', at.thumbnail_type,
            'thumbnail_size', at.thumbnail_size,
            'uploaded_by', to_jsonb(uploader_ms),
            'uploaded_at', at.uploaded_at
          )
        )
        ORDER BY aaa.sort_order NULLS LAST, aaa.added_at
      ) AS attachments
      FROM apply.approval_action_attachments aaa
      JOIN apply.attachments at ON at.id = aaa.attachment_id
      LEFT JOIN common.master_staffs added_ms    ON added_ms.id = aaa.added_by
      LEFT JOIN common.master_staffs uploader_ms ON uploader_ms.id = at.uploaded_by
      WHERE aaa.approval_action_id = aa.id
    ) aatt ON TRUE

    WHERE aa.order_id = o.id
  ) act ON TRUE

  WHERE o.application_id = a.id
) ords ON TRUE
;

GRANT SELECT ON apply.application_with_relations TO anon, authenticated, service_role;
