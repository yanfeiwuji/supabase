import ResetPasswordForm from 'components/interfaces/SignIn/ResetPasswordForm'
import { ForgotPasswordLayout } from 'components/layouts'
import { withAuth } from 'hooks'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { NextPageWithLayout } from 'types'

const ResetPasswordPage: NextPageWithLayout = () => {
  const { t } = useTranslation()
  return (
    <>
      <div className="flex flex-col gap-4">
        <ResetPasswordForm />
      </div>

      <div className="my-8 self-center text-sm">
        <span className="text-foreground-light">{t('Already have an account?')}</span>{' '}
        <Link href="/sign-in">
          <a className="underline hover:text-foreground-light">{t('Sign In')}</a>
        </Link>
      </div>
    </>
  )
}

ResetPasswordPage.getLayout = (page) => (
  <ForgotPasswordLayout
    heading="Reset Your Password"
    subheading="Type in a new secure password and press save to update your password"
  >
    {page}
  </ForgotPasswordLayout>
)

export default withAuth(ResetPasswordPage)
