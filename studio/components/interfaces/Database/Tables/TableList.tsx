import * as Tooltip from '@radix-ui/react-tooltip'
import { PermissionAction } from '@supabase/shared-types/out/constants'
import { noop, partition } from 'lodash'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'

import { useProjectContext } from 'components/layouts/ProjectLayout/ProjectContext'
import NoSearchResults from 'components/to-be-cleaned/NoSearchResults'
import Table from 'components/to-be-cleaned/Table'
import AlertError from 'components/ui/AlertError'
import SchemaSelector from 'components/ui/SchemaSelector'
import { GenericSkeletonLoader } from 'components/ui/ShimmeringLoader'
import { useSchemasQuery } from 'data/database/schemas-query'
import { useTablesQuery } from 'data/tables/tables-query'
import { useCheckPermissions, useStore } from 'hooks'
import { EXCLUDED_SCHEMAS } from 'lib/constants/schemas'
import { useTableEditorStateSnapshot } from 'state/table-editor'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  IconCheck,
  IconColumns,
  IconEdit,
  IconMoreVertical,
  IconPlus,
  IconSearch,
  IconTrash,
  IconX,
  Input,
} from 'ui'
import ProtectedSchemaWarning from '../ProtectedSchemaWarning'
import { useTranslation } from 'react-i18next'

interface TableListProps {
  onAddTable: () => void
  onEditTable: (table: any) => void
  onDeleteTable: (table: any) => void
  onOpenTable: (table: any) => void
}

const TableList = ({
  onAddTable = noop,
  onEditTable = noop,
  onDeleteTable = noop,
  onOpenTable = noop,
}: TableListProps) => {
  const { t } = useTranslation()
  const { meta } = useStore()
  const { project } = useProjectContext()
  const snap = useTableEditorStateSnapshot()

  const [filterString, setFilterString] = useState<string>('')
  const canUpdateTables = useCheckPermissions(PermissionAction.TENANT_SQL_ADMIN_WRITE, 'tables')

  const { data: schemas } = useSchemasQuery({
    projectRef: project?.ref,
    connectionString: project?.connectionString,
  })
  const [protectedSchemas] = partition(schemas ?? [], (schema) =>
    EXCLUDED_SCHEMAS.includes(schema?.name ?? '')
  )

  const {
    data: tables,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useTablesQuery(
    {
      projectRef: project?.ref,
      connectionString: project?.connectionString,
      schema: snap.selectedSchemaName,
    },
    {
      select(tables) {
        //  const filterTablesBySchema = tables.filter((table) => table.schema === schema?.name)

        return filterString.length === 0
          ? tables
          : tables.filter((table) => table.name.includes(filterString))
      },
    }
  )

  const publications = meta.publications.list()
  const realtimePublication = publications.find(
    (publication) => publication.name === 'supabase_realtime'
  )

  const schema = schemas?.find((schema) => schema.name === snap.selectedSchemaName)
  const isLocked = protectedSchemas.some((s) => s.id === schema?.id)

  return (
    <div className="space-y-4">
      <h3 className="mb-1 text-xl text-foreground">{t('Database Tables')}</h3>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <SchemaSelector
            className="w-[260px]"
            size="small"
            showError={false}
            selectedSchemaName={snap.selectedSchemaName}
            onSelectSchema={snap.setSelectedSchemaName}
          />
          <Input
            size="small"
            className="w-64"
            placeholder={t('Search for a table')}
            value={filterString}
            onChange={(e: any) => setFilterString(e.target.value)}
            icon={<IconSearch size="tiny" />}
          />
        </div>

        {!isLocked && (
          <div>
            <Tooltip.Root delayDuration={0}>
              <Tooltip.Trigger>
                <Button
                  disabled={!canUpdateTables}
                  icon={<IconPlus />}
                  onClick={() => onAddTable()}
                >
                  {t('New table')}
                </Button>
              </Tooltip.Trigger>
              {!canUpdateTables && (
                <Tooltip.Portal>
                  <Tooltip.Content side="bottom">
                    <Tooltip.Arrow className="radix-tooltip-arrow" />
                    <div
                      className={[
                        'rounded bg-scale-100 py-1 px-2 leading-none shadow',
                        'border border-scale-200',
                      ].join(' ')}
                    >
                      <span className="text-xs text-foreground">
                        You need additional permissions to create tables
                      </span>
                    </div>
                  </Tooltip.Content>
                </Tooltip.Portal>
              )}
            </Tooltip.Root>
          </div>
        )}
      </div>

      {isLocked && <ProtectedSchemaWarning schema={snap.selectedSchemaName} entity="tables" />}

      {isLoading && <GenericSkeletonLoader />}

      {isError && <AlertError error={error} subject="Failed to retrieve tables" />}

      {isSuccess &&
        (tables.length === 0 ? (
          <NoSearchResults />
        ) : (
          <div className="my-4 w-full">
            <Table
              head={[
                <Table.th key="name" className="hidden xl:table-cell ">
                  <p className="w-[160px]">{t('Name')}</p>
                </Table.th>,
                <Table.th key="description" className="hidden text-right xl:table-cell">
                  <p className="w-[160px]">{t('Description')}</p>
                </Table.th>,
                <Table.th key="rows" className="hidden text-right xl:table-cell">
                  <p className="w-[60px]">{t('Rows (Estimated)')}</p>
                </Table.th>,
                <Table.th key="size" className="hidden text-right xl:table-cell">
                  <p className="w-[80px]">{t('Size (Estimated)')}</p>
                </Table.th>,
                <Table.th key="realtime" className="hidden xl:table-cell text-center">
                  {t('Realtime Enabled')}
                </Table.th>,
                <Table.th key="buttons"></Table.th>,
              ]}
              body={
                <>
                  {tables.length === 0 && filterString.length === 0 && (
                    <Table.tr key={snap.selectedSchemaName}>
                      <Table.td colSpan={6}>
                        <p className="text-sm text-foreground">No tables created yet</p>
                        <p className="text-sm text-light">
                          There are no tables found in the schema "{snap.selectedSchemaName}"
                        </p>
                      </Table.td>
                    </Table.tr>
                  )}
                  {tables.length === 0 && filterString.length > 0 && (
                    <Table.tr key={snap.selectedSchemaName}>
                      <Table.td colSpan={6}>
                        <p className="text-sm text-foreground">No results found</p>
                        <p className="text-sm text-light">
                          Your search for "{filterString}" did not return any results
                        </p>
                      </Table.td>
                    </Table.tr>
                  )}
                  {tables.length > 0 &&
                    tables
                      .filter((table) => table.schema === schema?.name)
                      .map((x: any, i: any) => (
                        <Table.tr key={x.id} className="w-60">
                          <Table.td>
                            <p className="w-[160px] text-ellipsis overflow-hidden" title={x.name}>
                              {x.name}
                            </p>
                          </Table.td>
                          <Table.td className="hidden max-w-sm truncate lg:table-cell break-all whitespace-normal">
                            {x.comment !== null ? (
                              <p title={x.comment}>{x.comment}</p>
                            ) : (
                              <p className="text-scale-800">No description</p>
                            )}
                          </Table.td>
                          <Table.td className="hidden text-right xl:table-cell">
                            {(x.live_rows_estimate ?? x.live_row_count).toLocaleString()}
                          </Table.td>
                          <Table.td className="hidden text-right xl:table-cell">
                            <code className="text-sm">{x.size}</code>
                          </Table.td>
                          <Table.td className="hidden xl:table-cell text-center">
                            {(realtimePublication?.tables ?? []).find(
                              (table: any) => table.id === x.id
                            ) ? (
                              <div className="flex justify-center">
                                <IconCheck strokeWidth={2} className="text-brand" />
                              </div>
                            ) : (
                              <div className="flex justify-center">
                                <IconX strokeWidth={2} className="text-foreground-lighter" />
                              </div>
                            )}
                          </Table.td>
                          <Table.td>
                            <div className="flex justify-end gap-2">
                              <Button
                                type="default"
                                iconRight={<IconColumns />}
                                className="whitespace-nowrap hover:border-gray-500"
                                style={{ paddingTop: 3, paddingBottom: 3 }}
                                onClick={() => onOpenTable(x)}
                              >
                                {x.columns?.length} {t('columns')}
                              </Button>

                              {!isLocked && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger>
                                    <Button
                                      asChild
                                      type="default"
                                      icon={<IconMoreVertical />}
                                      className="px-1"
                                    >
                                      <span />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent side="bottom" align="end" className="w-32">
                                    <DropdownMenuItem
                                      disabled={!canUpdateTables}
                                      onClick={() => onEditTable(x)}
                                    >
                                      <Tooltip.Root delayDuration={0}>
                                        <Tooltip.Trigger className="flex items-center space-x-2">
                                          <IconEdit size="tiny" />
                                          <p>{t('Edit table')}</p>
                                        </Tooltip.Trigger>
                                        {!canUpdateTables && (
                                          <Tooltip.Portal>
                                            <Tooltip.Content side="bottom">
                                              <Tooltip.Arrow className="radix-tooltip-arrow" />
                                              <div
                                                className={[
                                                  'rounded bg-scale-100 py-1 px-2 leading-none shadow',
                                                  'border border-scale-200',
                                                ].join(' ')}
                                              >
                                                <span className="text-xs text-foreground">
                                                  {t(
                                                    'Additional permissions required to edit table'
                                                  )}
                                                </span>
                                              </div>
                                            </Tooltip.Content>
                                          </Tooltip.Portal>
                                        )}
                                      </Tooltip.Root>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                      disabled={!canUpdateTables || isLocked}
                                      onClick={() => onDeleteTable(x)}
                                    >
                                      <Tooltip.Root delayDuration={0}>
                                        <Tooltip.Trigger className="flex items-center space-x-2">
                                          <IconTrash stroke="red" size="tiny" />
                                          <p>{t('Delete table')}</p>
                                        </Tooltip.Trigger>
                                        {!canUpdateTables && (
                                          <Tooltip.Portal>
                                            <Tooltip.Content side="bottom">
                                              <Tooltip.Arrow className="radix-tooltip-arrow" />
                                              <div
                                                className={[
                                                  'rounded bg-scale-100 py-1 px-2 leading-none shadow',
                                                  'border border-scale-200',
                                                ].join(' ')}
                                              >
                                                <span className="text-xs text-foreground">
                                                  {t(
                                                    'Additional permissions required to delete table'
                                                  )}
                                                </span>
                                              </div>
                                            </Tooltip.Content>
                                          </Tooltip.Portal>
                                        )}
                                      </Tooltip.Root>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </Table.td>
                        </Table.tr>
                      ))}
                </>
              }
            />
          </div>
        ))}
    </div>
  )
}

export default observer(TableList)
