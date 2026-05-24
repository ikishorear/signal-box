"use client"

import * as React from "react"

import {
  DEFAULT_FOLLOW_REQUEST_IDS,
  getPersonByPeopleId,
  type Person,
} from "@/lib/people"

const FRIENDS_STORAGE_KEY = "signal-box-friends"
const REQUESTS_STORAGE_KEY = "signal-box-follow-requests"

type FriendsContextValue = {
  friends: Person[]
  friendIds: Set<string>
  followRequests: Person[]
  isFriend: (peopleId: string) => boolean
  addFriend: (person: Person) => void
  removeFriend: (peopleId: string) => void
  acceptFollowRequest: (peopleId: string) => void
  declineFollowRequest: (peopleId: string) => void
}

const FriendsContext = React.createContext<FriendsContextValue | null>(null)

function readFriendsFromStorage(): Person[] {
  if (typeof window === "undefined") return []

  try {
    const stored = window.localStorage.getItem(FRIENDS_STORAGE_KEY)
    if (!stored) return []

    const peopleIds = JSON.parse(stored) as string[]
    return peopleIds
      .map((peopleId) => getPersonByPeopleId(peopleId))
      .filter((person): person is Person => person !== undefined)
  } catch {
    return []
  }
}

function writeFriendsToStorage(friends: Person[]) {
  window.localStorage.setItem(
    FRIENDS_STORAGE_KEY,
    JSON.stringify(friends.map((friend) => friend.peopleId))
  )
}

function readRequestsFromStorage(friendIds: Set<string>): Person[] {
  if (typeof window === "undefined") return []

  try {
    const stored = window.localStorage.getItem(REQUESTS_STORAGE_KEY)
    const peopleIds = stored
      ? (JSON.parse(stored) as string[])
      : DEFAULT_FOLLOW_REQUEST_IDS

    return peopleIds
      .map((peopleId) => getPersonByPeopleId(peopleId))
      .filter(
        (person): person is Person =>
          person !== undefined && !friendIds.has(person.peopleId)
      )
  } catch {
    return DEFAULT_FOLLOW_REQUEST_IDS.map((peopleId) =>
      getPersonByPeopleId(peopleId)
    ).filter(
      (person): person is Person =>
        person !== undefined && !friendIds.has(person.peopleId)
    )
  }
}

function writeRequestsToStorage(requests: Person[]) {
  window.localStorage.setItem(
    REQUESTS_STORAGE_KEY,
    JSON.stringify(requests.map((person) => person.peopleId))
  )
}

export function FriendsProvider({ children }: { children: React.ReactNode }) {
  const [friends, setFriends] = React.useState<Person[]>([])
  const [followRequests, setFollowRequests] = React.useState<Person[]>([])

  React.useEffect(() => {
    const storedFriends = readFriendsFromStorage()
    const friendIds = new Set(storedFriends.map((friend) => friend.peopleId))

    setFriends(storedFriends)
    setFollowRequests(readRequestsFromStorage(friendIds))
  }, [])

  const friendIds = React.useMemo(
    () => new Set(friends.map((friend) => friend.peopleId)),
    [friends]
  )

  const addFriend = React.useCallback((person: Person) => {
    setFriends((current) => {
      if (current.some((friend) => friend.peopleId === person.peopleId)) {
        return current
      }

      const next = [...current, person]
      writeFriendsToStorage(next)
      return next
    })
  }, [])

  const removeFriend = React.useCallback((peopleId: string) => {
    setFriends((current) => {
      const next = current.filter((friend) => friend.peopleId !== peopleId)
      writeFriendsToStorage(next)
      return next
    })
  }, [])

  const acceptFollowRequest = React.useCallback(
    (peopleId: string) => {
      const person = getPersonByPeopleId(peopleId)
      if (!person) return

      addFriend(person)
      setFollowRequests((current) => {
        const next = current.filter((request) => request.peopleId !== peopleId)
        writeRequestsToStorage(next)
        return next
      })
    },
    [addFriend]
  )

  const declineFollowRequest = React.useCallback((peopleId: string) => {
    setFollowRequests((current) => {
      const next = current.filter((request) => request.peopleId !== peopleId)
      writeRequestsToStorage(next)
      return next
    })
  }, [])

  const isFriend = React.useCallback(
    (peopleId: string) => friendIds.has(peopleId.toUpperCase()),
    [friendIds]
  )

  const value = React.useMemo(
    () => ({
      friends,
      friendIds,
      followRequests,
      isFriend,
      addFriend,
      removeFriend,
      acceptFollowRequest,
      declineFollowRequest,
    }),
    [
      friends,
      friendIds,
      followRequests,
      isFriend,
      addFriend,
      removeFriend,
      acceptFollowRequest,
      declineFollowRequest,
    ]
  )

  return (
    <FriendsContext.Provider value={value}>{children}</FriendsContext.Provider>
  )
}

export function useFriends() {
  const context = React.useContext(FriendsContext)
  if (!context) {
    throw new Error("useFriends must be used within a FriendsProvider.")
  }
  return context
}
