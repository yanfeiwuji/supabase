import { PermissionAction } from '@supabase/shared-types/out/constants'

import { useProjectContext } from 'components/layouts/ProjectLayout/ProjectContext'
import ProductEmptyState from 'components/to-be-cleaned/ProductEmptyState'
import { useEntityTypesQuery } from 'data/entity-types/entity-types-infinite-query'
import { useCheckPermissions, useLocalStorage } from 'hooks'
import { EXCLUDED_SCHEMAS } from 'lib/constants/schemas'
import { useTranslation } from 'react-i18next'
import { useTableEditorStateSnapshot } from 'state/table-editor'

export interface EmptyStateProps {}

const EmptyState = ({}: EmptyStateProps) => {
  const { t } = useTranslation()
  const snap = useTableEditorStateSnapshot()
  const isProtectedSchema = EXCLUDED_SCHEMAS.includes(snap.selectedSchemaName)
  const canCreateTables =
    useCheckPermissions(PermissionAction.TENANT_SQL_ADMIN_WRITE, 'tables') && !isProtectedSchema

  const [sort] = useLocalStorage<'alphabetical' | 'grouped-alphabetical'>(
    'table-editor-sort',
    'alphabetical'
  )

  const { project } = useProjectContext()
  const { data } = useEntityTypesQuery(
    {
      projectRef: project?.ref,
      connectionString: project?.connectionString,
      schema: snap.selectedSchemaName,
      sort,
    },
    {
      keepPreviousData: true,
    }
  )

  const totalCount = data?.pages?.[0].data.count ?? 0

  return (
    <div className="w-full h-full flex items-center justify-center">
      {totalCount === 0 ? (
        <ProductEmptyState
          title={t('Table Editor')}
          ctaButtonLabel={canCreateTables ? t('Create a new table') : undefined}
          onClickCta={canCreateTables ? snap.onAddTable : undefined}
        >
          <p className="text-sm text-foreground-light">
            {t('There are no tables available in this schema')}.
          </p>
        </ProductEmptyState>
      ) : (
        <div className="flex flex-col items-center space-y-4">
          <ProductEmptyState
            title={t('Table Editor')}
            ctaButtonLabel={canCreateTables ? t('Create a new table') : undefined}
            onClickCta={canCreateTables ? snap.onAddTable : undefined}
          >
            <p className="text-sm text-foreground-light">
              {t('Select a table from the navigation panel on the left to view its data')}
              {canCreateTables && `, ${t('or create a new one')}.`}
            </p>
          </ProductEmptyState>
        </div>
      )}
    </div>
  )
}

export default EmptyState
