import { ReactNode, useMemo } from 'react'
import { withAuth } from 'hooks'
import { ProjectLayoutNonBlocking } from '../'
import SQLEditorMenu from './SQLEditorMenu'
import { useTranslation } from 'react-i18next'

export interface SQLEditorLayoutProps {
  title: string
  children: ReactNode
}

const SQLEditorLayout = ({ title, children }: SQLEditorLayoutProps) => {
  const { t } = useTranslation()
  const productMenu = useMemo(() => <SQLEditorMenu key="sql-editor-menu" />, [])

  return (
    <ProjectLayoutNonBlocking
      title={title || 'SQL'}
      product={t('SQL Editor')}
      productMenu={productMenu}
    >
      {children}
    </ProjectLayoutNonBlocking>
  )
}

export default withAuth(SQLEditorLayout)
