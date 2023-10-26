import { IconAlertCircle } from 'ui'

import InformationBox from 'components/ui/InformationBox'
import { useTranslation } from 'react-i18next'

interface NotFoundStateProps {
  id: string | number
}

const NotFoundState = ({ id }: NotFoundStateProps) => {
  const { t } = useTranslation()
  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-[400px]">
        <InformationBox
          icon={<IconAlertCircle strokeWidth={2} />}
          title={t(`Unable to find your table with ID`, { table: id })}
        />
      </div>
    </div>
  )
}

export default NotFoundState
