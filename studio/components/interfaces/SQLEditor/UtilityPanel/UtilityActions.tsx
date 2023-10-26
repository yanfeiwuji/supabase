import * as Tooltip from '@radix-ui/react-tooltip'
import { IS_PLATFORM } from 'lib/constants'
import { detectOS } from 'lib/helpers'
import { Button, IconAlignLeft, IconCommand, IconCornerDownLeft } from 'ui'

import FavoriteButton from './FavoriteButton'
import SavingIndicator from './SavingIndicator'
import SizeToggleButton from './SizeToggleButton'
import { useTranslation } from 'react-i18next'

export type UtilityActionsProps = {
  id: string
  isExecuting?: boolean
  isDisabled?: boolean
  prettifyQuery: () => void
  executeQuery: () => void
}

const UtilityActions = ({
  id,
  isExecuting = false,
  isDisabled = false,
  prettifyQuery,
  executeQuery,
}: UtilityActionsProps) => {
  const { t } = useTranslation()
  const os = detectOS()

  return (
    <>
      <SavingIndicator id={id} />
      {IS_PLATFORM && <FavoriteButton id={id} />}
      <SizeToggleButton id={id} />
      <Tooltip.Root delayDuration={0}>
        <Tooltip.Trigger asChild>
          <Button
            type="text"
            onClick={() => prettifyQuery()}
            icon={<IconAlignLeft size="tiny" strokeWidth={2} className="text-gray-1100" />}
          />
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content side="bottom">
            <Tooltip.Arrow className="radix-tooltip-arrow" />
            <div
              className={[
                'rounded bg-scale-100 py-1 px-2 leading-none shadow',
                'border border-scale-200',
              ].join(' ')}
            >
              <span className="text-xs text-foreground">{t('Prettify SQL')}</span>
            </div>
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
      <Button
        onClick={() => executeQuery()}
        disabled={isDisabled || isExecuting}
        loading={isExecuting}
        type="default"
        size="tiny"
        className="mx-2"
        iconRight={
          <div className="flex items-center space-x-1">
            {os === 'macos' ? (
              <IconCommand size={10} strokeWidth={1.5} />
            ) : (
              <p className="text-xs text-foreground-light">CTRL</p>
            )}
            <IconCornerDownLeft size={10} strokeWidth={1.5} />
          </div>
        }
      >
        {t('RUN')}
      </Button>
    </>
  )
}

export default UtilityActions
