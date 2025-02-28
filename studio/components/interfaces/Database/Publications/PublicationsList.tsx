import { PermissionAction } from '@supabase/shared-types/out/constants'
import { noop } from 'lodash'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { Button, IconAlertCircle, IconSearch, Input, Toggle } from 'ui'

import { confirmAlert } from 'components/to-be-cleaned/ModalsDeprecated/ConfirmModal'
import Table from 'components/to-be-cleaned/Table'
import InformationBox from 'components/ui/InformationBox'
import NoSearchResults from 'components/ui/NoSearchResults'
import { useCheckPermissions, useStore } from 'hooks'
import { useTranslation } from 'react-i18next'

interface PublicationsListProps {
  onSelectPublication: (id: number) => void
}

const PublicationsList = ({ onSelectPublication = noop }: PublicationsListProps) => {
  const { t } = useTranslation()
  const { ui, meta } = useStore()
  const [filterString, setFilterString] = useState<string>('')

  const canUpdatePublications = useCheckPermissions(
    PermissionAction.TENANT_SQL_ADMIN_WRITE,
    'publications'
  )

  const publicationEvents = [
    { event: 'Insert', key: 'publish_insert' },
    { event: 'Update', key: 'publish_update' },
    { event: 'Delete', key: 'publish_delete' },
    { event: 'Truncate', key: 'publish_truncate' },
  ]
  const publications =
    filterString.length === 0
      ? meta.publications.list()
      : meta.publications.list((publication: any) => publication.name.includes(filterString))

  const toggleListenEvent = async (publication: any, event: any, currentStatus: any) => {
    const startStop = currentStatus ? 'stop' : 'start'
    confirmAlert({
      title: t('Confirm'),
      message: `Are you sure you want to ${startStop} sending ${event} events for ${publication.name}?`,
      onAsyncConfirm: async () => {
        try {
          let payload: any = { id: publication.id }
          payload[`publish_${event}`] = !currentStatus
          const { data, error }: any = await meta.publications.update(publication.id, payload)
          if (error) {
            throw error
          } else {
            return data
          }
        } catch (error: any) {
          ui.setNotification({
            category: 'error',
            message: `Failed to toggle for ${publication.name}: ${error.message}`,
          })
          return false
        }
      },
    })
  }

  return (
    <>
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Input
              size="small"
              icon={<IconSearch size="tiny" />}
              placeholder={t('Filter')}
              value={filterString}
              onChange={(e) => setFilterString(e.target.value)}
            />
          </div>
          {!canUpdatePublications && (
            <div className="w-[500px]">
              <InformationBox
                icon={<IconAlertCircle className="text-foreground-light" strokeWidth={2} />}
                title="You need additional permissions to update database replications"
              />
            </div>
          )}
        </div>
      </div>
      {publications.length === 0 ? (
        <NoSearchResults searchString={filterString} onResetFilter={() => setFilterString('')} />
      ) : (
        <div className="overflow-hidden rounded">
          <Table
            head={[
              <Table.th key="header.name">{t('Name')}</Table.th>,
              <Table.th key="header.id" className="hidden lg:table-cell">
                {t('System ID')}
              </Table.th>,
              <Table.th key="header.insert">{t('Insert')}</Table.th>,
              <Table.th key="header.update">{t('Update')}</Table.th>,
              <Table.th key="header.delete">{t('Delete')}</Table.th>,
              <Table.th key="header.truncate">{t('Truncate')}</Table.th>,
              <Table.th key="header.source" className="text-right">
                {t('Source')}
              </Table.th>,
            ]}
            body={publications.map((x: any, i: number) => (
              <Table.tr className="border-t " key={x.name}>
                <Table.td className="px-4 py-3" style={{ width: '25%' }}>
                  {x.name}
                </Table.td>
                <Table.td className="hidden lg:table-cell" style={{ width: '25%' }}>
                  {x.id}
                </Table.td>
                {publicationEvents.map((event) => (
                  <Table.td key={event.key}>
                    <Toggle
                      size="tiny"
                      checked={x[event.key]}
                      disabled={!canUpdatePublications}
                      onChange={() => toggleListenEvent(x, event.event.toLowerCase(), x[event.key])}
                    />
                  </Table.td>
                ))}
                <Table.td className="px-4 py-3 pr-2">
                  <div className="flex justify-end gap-2">
                    <Button
                      type="default"
                      style={{ paddingTop: 3, paddingBottom: 3 }}
                      onClick={() => onSelectPublication(x.id)}
                    >
                      {x.tables == null
                        ? t('All tables')
                        : `${x.tables.length} ${
                            x.tables.length > 1 || x.tables.length == 0 ? t('tables') : t('table')
                          }`}
                    </Button>
                  </div>
                </Table.td>
              </Table.tr>
            ))}
          />
        </div>
      )}
    </>
  )
}

export default observer(PublicationsList)
