import { NextPage } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from 'ui'
import { useTheme } from 'next-themes'
import { BASE_PATH } from 'lib/constants'
import { useTranslation } from 'react-i18next'

const Error404: NextPage = ({}) => {
  const { resolvedTheme } = useTheme()
  const [show404, setShow404] = useState<boolean>(false)
  const { t } = useTranslation()
  useEffect(() => {
    setTimeout(() => {
      setShow404(true)
    }, 500)
  }, [])

  return (
    <div className="relative mx-auto flex h-screen w-full flex-col items-center justify-center">
      <div className="absolute top-0 mx-auto w-full max-w-7xl px-8 pt-6 sm:px-6 lg:px-8">
        <nav className="relative flex items-center justify-between sm:h-10">
          <div className="flex flex-shrink-0 flex-grow items-center lg:flex-grow-0">
            <div className="flex w-full items-center justify-between md:w-auto">
              <Link href="/projects">
                <a>
                  <Image
                    src={
                      resolvedTheme === 'dark'
                        ? `${BASE_PATH}/img/supabase-dark.svg`
                        : `${BASE_PATH}/img/supabase-light.svg`
                    }
                    alt="supabase"
                    height={24}
                    width={120}
                  />
                </a>
              </Link>
            </div>
          </div>
        </nav>
      </div>
      <div
        className={`absolute select-none opacity-[5%] filter transition duration-200 ${
          show404 ? 'blur-sm' : 'blur-none'
        }`}
      >
        <h1 style={{ fontSize: '28rem' }}>404</h1>
      </div>
      <div
        className={`flex flex-col items-center justify-center space-y-6 transition ${
          show404 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex w-[380px] flex-col items-center justify-center space-y-3 text-center">
          <h3 className="text-xl">Looking for something? 🔍</h3>
          <p className="text-foreground-light">
            {t("We couldn't find the page that you're looking for!")}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/projects">
            <a>
              <Button size="small">{t('Head back')}</Button>
            </a>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Error404
