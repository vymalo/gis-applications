'use client';

import { type FormEvent, useEffect, useState } from 'react';
import { authClient } from '@app/auth/client';
import { LogIn, RefreshCw, Send, Trash2 } from 'react-feather';

type DeviceSession =
  Awaited<ReturnType<typeof authClient.multiSession.listDeviceSessions>> extends {
      data: Array<infer Item>;
    }
    ? Item
    : never;

function formatDate(value?: string | Date) {
  if (!value) {
    return 'Just now';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Just now';
  }
  return date.toLocaleString();
}

export function multiSessionLogin() {
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activatingToken, setActivatingToken] = useState<string | null>(null);
  const [revokingToken, setRevokingToken] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadSessions() {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const deviceSessions = await authClient.multiSession.listDeviceSessions();
      setSessions(deviceSessions?.data ?? []);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to load saved sessions right now.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadSessions();
  }, []);

  async function activateSession(sessionToken: string) {
    setErrorMessage(null);
    setInfoMessage(null);
    setActivatingToken(sessionToken);
    try {
      await authClient.multiSession.setActive({ sessionToken });
      window.location.href = '/apply';
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to switch sessions right now.',
      );
      void loadSessions();
    } finally {
      setActivatingToken(null);
    }
  }

  async function removeSession(sessionToken: string) {
    setErrorMessage(null);
    setInfoMessage(null);
    setRevokingToken(sessionToken);
    try {
      await authClient.multiSession.revoke({ sessionToken });
      await loadSessions();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to remove this session right now.',
      );
    } finally {
      setRevokingToken(null);
    }
  }

  async function sendMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    if (!email.trim()) {
      setErrorMessage('Enter an email to receive your login link.');
      return;
    }

    setIsSending(true);
    try {
      await authClient.signIn.magicLink({
        email: email.trim(),
        callbackURL: '/apply',
      });
      setInfoMessage(
        'Check your email for the magic link. Opening it will add a session here.',
      );
      setEmail('');
      await loadSessions();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to send the login link right now.',
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="card card-border bg-base-200/60">
      <div className="card-body gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">Sessions</h2>
            <p className="text-sm opacity-70">
              Use an existing session or add a new one.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => void loadSessions()}
            disabled={isLoading}>
            <RefreshCw className={isLoading ? 'animate-spin' : ''} size={16} />
            <span>Refresh</span>
          </button>
        </div>

        {errorMessage && (
          <div className="alert alert-error">
            <span className="font-semibold">Something went wrong.</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {infoMessage && (
          <div className="alert alert-success">
            <span className="font-semibold">Email sent.</span>
            <span>{infoMessage}</span>
          </div>
        )}

        <div className="space-y-3">
          {isLoading && (
            <div className="flex items-center gap-2 text-sm opacity-80">
              <span className="loading loading-spinner loading-sm" />
              <span>Loading sessions...</span>
            </div>
          )}

          {!isLoading && sessions.length === 0 && (
            <p className="text-sm opacity-80">No sessions saved yet.</p>
          )}

          {!isLoading &&
            sessions.map((item) => {
              const token = item.session.token;
              const isActivating = activatingToken === token;
              const isRevoking = revokingToken === token;
              return (
                <div
                  key={token}
                  className="flex flex-col gap-2 rounded-lg border border-base-300 bg-base-100 p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold">{item.user.email}</span>
                    <span className="text-xs opacity-70">
                      Active until {formatDate(item.session.expiresAt)} · Last updated {formatDate(item.session.updatedAt)}
                    </span>
                  </div>
                  <div className="flex flex-row flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => void activateSession(token)}
                      disabled={isActivating}>
                      {isActivating ? (
                        <span className="loading loading-spinner loading-xs" />
                      ) : (
                        <LogIn size={16} />
                      )}
                      <span>Use</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm text-error"
                      onClick={() => void removeSession(token)}
                      disabled={isRevoking}>
                      {isRevoking ? (
                        <span className="loading loading-spinner loading-xs" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              );
            })}
        </div>

        <div className="divider my-2" />

        <div className="flex flex-col gap-3">
          <form
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
            onSubmit={sendMagicLink}>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="input input-bordered w-full"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <button
              type="submit"
              className="btn btn-primary w-full sm:w-auto"
            >
              {isSending ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <Send size={16} />
              )}
              <span>Send link</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
