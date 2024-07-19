import fs from "fs/promises";
import path from "path";
import matter from 'gray-matter'

async function getMDXFiles(dir: string) {
    return (await fs.readdir(dir)).filter(file => path.extname(file) === '.mdx')
}

async function readMDXFile(filePath: string) {
    const rawContent = await fs.readFile(filePath, { encoding: 'utf-8' })
    return matter(rawContent)
}

async function getMDXData(dir: string) {
    const mdxFiles = await getMDXFiles(dir);
    const results = []

    for (const file of mdxFiles) {
        const { data: metadata, content } = await readMDXFile(path.join(dir, file))
        const slug = path.basename(file, path.extname(file))
        results.push({
            metadata,
            content,
            slug
        })
    }

    return results
}

export async function getBlogPosts() {
    return await getMDXData(path.join(process.cwd(), 'src', 'app', 'blog', '_contents'))
}

export function formatDate(date: string, includeRelative = false) {
    const currentDate = new Date()
    if (!date.includes('T')) {
        date = `${date}T00:00:00`
    }

    const targetDate = new Date(date)
    const yearsAgo = currentDate.getFullYear() - targetDate.getFullYear()
    const monthsAgo = currentDate.getMonth() - targetDate.getMonth()
    const daysAgo = currentDate.getDay() - targetDate.getDay()

    let formattedDate = ""

    if (yearsAgo > 0) {
        formattedDate = `${yearsAgo}y ago`
    }
    else if (monthsAgo > 0) {
        formattedDate = `${monthsAgo}mo ago`
    }
    else if (daysAgo > 0) {
        formattedDate = `${daysAgo}d ago`
    } else {
        formattedDate = 'Today'
    }

    const fullDate = targetDate.toLocaleString('en-US', {
        month: 'long',
        day: '2-digit',
        year: 'numeric'
    })

    if (includeRelative) {
        return `${fullDate} (${formattedDate})`
    } else {
        return fullDate
    }
}