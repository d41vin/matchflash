"use client"

import {
  AddressType,
  darkTheme,
  PhantomProvider,
  useModal,
  usePhantom,
  useSolana,
} from "@phantom/react-sdk"
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react"
import { usePathname } from "next/navigation"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react"

type MatchFlashAuth = {
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  requestSignIn: () => Promise<void>
  fetchAccessToken: (forceRefreshToken?: boolean) => Promise<string | null>
}

const MatchFlashAuthContext = createContext<MatchFlashAuth | null>(null)

function toBase64Url(bytes: Uint8Array) {
  let binary = ""
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return window
    .btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "")
}

async function readJson<T>(response: Response) {
  const body = (await response.json()) as T & { error?: string }
  if (!response.ok) {
    throw new Error(body.error ?? "Wallet verification failed.")
  }
  return body
}

function MatchFlashAuthProvider({ children }: PropsWithChildren) {
  const pathname = usePathname()
  const { addresses, isConnected, isLoading: phantomIsLoading } = usePhantom()
  const { open } = useModal()
  const { solana, isAvailable } = useSolana()
  const [token, setToken] = useState<string | null>(null)
  const tokenRef = useRef<string | null>(null)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const walletAddress = addresses.find(
    (address) => address.addressType === AddressType.solana
  )?.address

  const authenticate = useCallback(async () => {
    if (!walletAddress || !isAvailable) {
      throw new Error("A Solana wallet is required to sign in.")
    }

    setIsAuthenticating(true)
    setError(null)
    try {
      const challengeResponse = await fetch("/api/auth/phantom/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      })
      const challenge = await readJson<{ message: string }>(challengeResponse)
      const signed = await solana.signMessage(challenge.message)
      const completionResponse = await fetch("/api/auth/phantom/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature: toBase64Url(signed.signature) }),
      })
      const completion = await readJson<{ token: string }>(completionResponse)
      tokenRef.current = completion.token
      setToken(completion.token)
    } catch (cause) {
      tokenRef.current = null
      setToken(null)
      setError(cause instanceof Error ? cause.message : "Wallet verification failed.")
      throw cause
    } finally {
      setIsAuthenticating(false)
    }
  }, [isAvailable, solana, walletAddress])

  useEffect(() => {
    if (!isConnected) {
      tokenRef.current = null
      setToken(null)
      setError(null)
      return
    }

    if (pathname === "/txline-devnet") {
      return
    }

    if (walletAddress && !tokenRef.current && !isAuthenticating) {
      void authenticate().catch(() => undefined)
    }
  }, [authenticate, isAuthenticating, isConnected, pathname, walletAddress])

  const requestSignIn = useCallback(async () => {
    if (!isConnected) {
      open()
      return
    }
    await authenticate()
  }, [authenticate, isConnected, open])

  const fetchAccessToken = useCallback(
    async (forceRefreshToken = false) => {
      if (forceRefreshToken) {
        await authenticate()
      }
      return tokenRef.current
    },
    [authenticate]
  )

  const value = useMemo<MatchFlashAuth>(
    () => ({
      isAuthenticated: token !== null,
      isLoading: phantomIsLoading || isAuthenticating,
      error,
      requestSignIn,
      fetchAccessToken,
    }),
    [error, fetchAccessToken, isAuthenticating, phantomIsLoading, requestSignIn, token]
  )

  return <MatchFlashAuthContext.Provider value={value}>{children}</MatchFlashAuthContext.Provider>
}

function useAuthForConvex() {
  const auth = useMatchFlashAuth()
  return useMemo(
    () => ({
      isLoading: auth.isLoading,
      isAuthenticated: auth.isAuthenticated,
      fetchAccessToken: async ({ forceRefreshToken }: { forceRefreshToken: boolean }) =>
        auth.fetchAccessToken(forceRefreshToken),
    }),
    [auth]
  )
}

export function useMatchFlashAuth() {
  const auth = useContext(MatchFlashAuthContext)
  if (!auth) {
    throw new Error("useMatchFlashAuth must be used within MatchFlashProviders.")
  }
  return auth
}

export function MatchFlashProviders({ children }: PropsWithChildren) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
  const phantomAppId = process.env.NEXT_PUBLIC_PHANTOM_APP_ID
  const redirectUrl = process.env.NEXT_PUBLIC_REDIRECT_URL
  const [convex] = useState(() => {
    if (!convexUrl) {
      throw new Error("NEXT_PUBLIC_CONVEX_URL must be configured.")
    }
    return new ConvexReactClient(convexUrl)
  })

  if (!phantomAppId || !redirectUrl) {
    throw new Error("Phantom Connect environment variables must be configured.")
  }

  return (
    <PhantomProvider
      config={{
        appId: phantomAppId,
        providers: ["google", "apple", "injected"],
        addressTypes: [AddressType.solana],
        authOptions: { redirectUrl },
      }}
      theme={darkTheme}
      appName="MatchFlash"
    >
      <MatchFlashAuthProvider>
        <ConvexProviderWithAuth client={convex} useAuth={useAuthForConvex}>
          {children}
        </ConvexProviderWithAuth>
      </MatchFlashAuthProvider>
    </PhantomProvider>
  )
}
