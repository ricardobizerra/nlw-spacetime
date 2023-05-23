import { api } from '@/lib/api'
import { getUser } from '@/lib/auth'
import dayjs from 'dayjs'
import ptBr from 'dayjs/locale/pt-br'
import { cookies } from 'next/headers'
import Image from 'next/image'

dayjs.locale(ptBr)

interface Memory {
  id: number
  createdAt: string
  coverUrl: string
  content: string
  isPublic: boolean
  userId: string
}

export default async function IndividualMemory({
  params,
}: {
  params: { id: string }
}) {
  const token = cookies().get('token')?.value
  const response = await api.get(`/memories/${params.id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const { name, avatarUrl } = getUser()

  const memory: Memory = response.data

  if (memory.isPublic)
    return (
      <div className="flex flex-col gap-8 p-8">
        <time className="-ml-8 flex items-center gap-2 text-sm text-gray-100 before:h-px before:w-5 before:bg-gray-50">
          {dayjs(memory.createdAt).format('D[ de ]MMMM[, ]YYYY')}
        </time>

        <div className="flex items-center gap-3 text-left">
          <Image
            src={avatarUrl}
            width={40}
            height={40}
            alt="Foto de perfil do GitHub da pessoa usuária"
            className="h-10 w-10 rounded-full"
          />

          <p className="max-w-[140px] text-sm leading-snug">{name}</p>
        </div>

        <Image
          src={memory.coverUrl}
          width={592}
          height={280}
          className="aspect-video w-full rounded-lg object-cover"
          alt=""
        />

        <p>{memory.content}</p>
      </div>
    )
}
