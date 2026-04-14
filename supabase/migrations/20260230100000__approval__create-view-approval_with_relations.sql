DROP VIEW IF EXISTS approval.approval_with_relations;

CREATE OR REPLACE VIEW approval.approval_with_relations
WITH (security_invoker = on)
AS
SELECT
  a.*,
  to_jsonb(author_ms) AS author,
  to_jsonb(dept_md)   AS department,
  to_jsonb(status_ms) AS status,

  COALESCE(revs.revisions, '[]'::jsonb)    AS approval_revisions,
  COALESCE(ords.orders, '[]'::jsonb)       AS approval_orders,
  COALESCE(revws.reviewers, '[]'::jsonb)   AS approval_reviewers

FROM approval.approvals a
LEFT JOIN common.master_staffs      author_ms ON author_ms.id = a.author_id
LEFT JOIN common.master_departments dept_md   ON dept_md.id   = a.department_id
LEFT JOIN approval.master_status    status_ms ON status_ms.id = a.status_id

-- ===== revisions 1:N (LATERAL) + revision_attachments + attachments =====
LEFT JOIN LATERAL (
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', re.id,
      'approval_id', re.approval_id,
      'snapshot_by', to_jsonb(revision_ms),
      'round', re.round,
      'budget', re.budget,
      'details', re.details,
      'depreciation_period_months', re.depreciation_period_months,
      'depreciation_amount', re.depreciation_amount,
      'start_date', re.start_date,
      'end_date', re.end_date,
      'billing_date', re.billing_date,
      'payment_date', re.payment_date,
      'snapshot_at', re.snapshot_at,

      -- revisions -> attachments[]
      'attachments', COALESCE(att.attachments, '[]'::jsonb)
    )
    ORDER BY re.round
  ) AS revisions
  FROM approval.approval_revisions re
  LEFT JOIN common.master_staffs revision_ms ON revision_ms.id = re.snapshot_by

  -- ===== attachments for each revision (LATERAL) =====
  LEFT JOIN LATERAL (
    SELECT jsonb_agg(
      jsonb_build_object(
        'approval_revision_id', ara.approval_revision_id,
        'attachment_id', ara.attachment_id,
        'role', ara.role,
        'sort_order', ara.sort_order,
        'added_by', to_jsonb(added_ms),
        'added_at', ara.added_at,

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
      ORDER BY ara.sort_order NULLS LAST, ara.added_at
    ) AS attachments
    FROM approval.approval_revision_attachments ara
    JOIN approval.attachments at ON at.id = ara.attachment_id
    LEFT JOIN common.master_staffs added_ms    ON added_ms.id = ara.added_by
    LEFT JOIN common.master_staffs uploader_ms ON uploader_ms.id = at.uploaded_by
    WHERE ara.approval_revision_id = re.id
  ) att ON TRUE

  WHERE re.approval_id = a.id
) revs ON TRUE

-- ===== orders 1:N + actions (LATERAL) =====
LEFT JOIN LATERAL (
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', o.id,
      'approval_id', o.approval_id,
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
  FROM approval.approval_orders o
  LEFT JOIN common.master_staffs   approver_ms     ON approver_ms.id = o.approver_user_id
  LEFT JOIN approval.master_status order_status_ms ON order_status_ms.id = o.status_id

  -- actions for each order
  LEFT JOIN LATERAL (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', aa.id,
        'approval_id', aa.approval_id,
        'action', aa.action,
        'actor_user_id', aa.actor_user_id,
        'actor_user', to_jsonb(actor_ms),
        'order_id', aa.order_id,
        'comment', aa.comment,
        'action_at', aa.action_at,

        -- ★追加：action -> attachments[]
        'attachments', COALESCE(aatt.attachments, '[]'::jsonb)
      )
      ORDER BY aa.action_at
    ) AS actions
    FROM approval.approval_actions aa
    LEFT JOIN common.master_staffs actor_ms ON actor_ms.id = aa.actor_user_id

    -- ★ action attachments (LATERAL)
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
      FROM approval.approval_action_attachments aaa
      JOIN approval.attachments at ON at.id = aaa.attachment_id
      LEFT JOIN common.master_staffs added_ms    ON added_ms.id = aaa.added_by
      LEFT JOIN common.master_staffs uploader_ms ON uploader_ms.id = at.uploaded_by
      WHERE aaa.approval_action_id = aa.id
    ) aatt ON TRUE

    WHERE aa.order_id = o.id
  ) act ON TRUE

  WHERE o.approval_id = a.id
) ords ON TRUE

-- ===== reviewers 1:N + actions (LATERAL) =====
LEFT JOIN LATERAL (
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', r.id,
      'approval_id', r.approval_id,
      'reviewer_user_id', r.reviewer_user_id,
      'reviewer_user', to_jsonb(reviewer_ms),
      'is_commented', r.is_commented,
      'created_at', r.created_at,
      'updated_at', r.updated_at,
      'actions', COALESCE(ract.actions, '[]'::jsonb)
    )
    ORDER BY r.created_at
  ) AS reviewers
  FROM approval.approval_reviewers r
  LEFT JOIN common.master_staffs reviewer_ms ON reviewer_ms.id = r.reviewer_user_id

  -- actions for each reviewer
  LEFT JOIN LATERAL (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', aa.id,
        'approval_id', aa.approval_id,
        'action', aa.action,
        'actor_user_id', aa.actor_user_id,
        'actor_user', to_jsonb(actor_ms),
        'reviewer_id', aa.reviewer_id,
        'comment', aa.comment,
        'action_at', aa.action_at,

        -- ★追加：action -> attachments[]
        'attachments', COALESCE(aatt.attachments, '[]'::jsonb)
      )
      ORDER BY aa.action_at
    ) AS actions
    FROM approval.approval_actions aa
    LEFT JOIN common.master_staffs actor_ms ON actor_ms.id = aa.actor_user_id

    -- ★ action attachments (LATERAL)
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
      FROM approval.approval_action_attachments aaa
      JOIN approval.attachments at ON at.id = aaa.attachment_id
      LEFT JOIN common.master_staffs added_ms    ON added_ms.id = aaa.added_by
      LEFT JOIN common.master_staffs uploader_ms ON uploader_ms.id = at.uploaded_by
      WHERE aaa.approval_action_id = aa.id
    ) aatt ON TRUE

    WHERE aa.reviewer_id = r.id
  ) ract ON TRUE

  WHERE r.approval_id = a.id
) revws ON TRUE;

GRANT SELECT ON approval.approval_with_relations TO anon, authenticated, service_role;
