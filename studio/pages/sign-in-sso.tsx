import SignInSSOForm from 'components/interfaces/SignIn/SignInSSOForm'
import { SignInLayout } from 'components/layouts'
import { useTranslation } from 'react-i18next'
import { NextPageWithLayout } from 'types'

const SignInSSOPage: NextPageWithLayout = () => {
  const { t } = useTranslation()
  return (
    <>
      <div className="flex flex-col gap-5">
        <SignInSSOForm />
      </div>

      <div className="my-8 self-center text-sm">
        <div>
          <span className="text-foreground-light">{t('Interested in SSO')}?</span>{' '}
          <a
            href="https://supabase.com/contact/enterprise"
            rel="noopener noreferrer"
            className="underline text-foreground hover:text-foreground-light transition"
          >
            {t('Let Us Know')}
          </a>
        </div>
      </div>
    </>
  )
}

SignInSSOPage.getLayout = (page) => (
  <SignInLayout
    heading="Welcome back"
    subheading="Sign in to your enterprise account"
    logoLinkToMarketingSite={true}
  >
    {page}
  </SignInLayout>
)

export default SignInSSOPage
