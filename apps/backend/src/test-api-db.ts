/**
 * API 테스트 스크립트
 * 게시글 작성 API를 호출하여 DB에 데이터가 저장되는지 확인
 */

import dotenv from 'dotenv';
dotenv.config();

const API_BASE_URL = process.env.FRONTEND_URL?.replace('http://localhost:3000', 'http://localhost:3001') || 'http://localhost:3001';

// API 응답 타입 정의
interface AuthResponse {
    success: boolean;
    data: {
        user: {
            id: string;
            email: string;
            provider: string;
        };
        token: string;
    };
}

interface PostResponse {
    success: boolean;
    data: {
        id: string;
        title: string;
        content: string;
        authorId: string;
        authorEmail?: string;
        thumbnailImage?: string;
        attachments: string[];
        comments: any[];
        createdAt: string;
        updatedAt: string;
    };
}

interface PostsListResponse {
    success: boolean;
    data: {
        posts: Array<{
            id: string;
            title: string;
            content: string;
            authorId: string;
            authorEmail?: string;
            thumbnailImage?: string;
            attachments: string[];
            comments: any[];
            createdAt: string;
            updatedAt: string;
        }>;
        total: number;
        page: number;
        limit: number;
    };
}

async function testPostAPI() {
    console.log('🧪 API 테스트 시작...\n');

    try {
        // 1. 사용자 회원가입
        console.log('1️⃣  사용자 회원가입...');
        const registerResponse = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: `test_${Date.now()}@example.com`,
                password: 'Test123!@#',
            }),
        });

        const registerData = (await registerResponse.json()) as AuthResponse;

        if (!registerResponse.ok) {
            console.error('❌ 회원가입 실패:', registerData);
            return;
        }

        console.log('✅ 회원가입 성공');
        const token = registerData.data.token;
        const userId = registerData.data.user.id;
        console.log(`   사용자 ID: ${userId}`);
        console.log(`   토큰: ${token.substring(0, 20)}...\n`);

        // 2. 게시글 작성
        console.log('2️⃣  게시글 작성...');
        const postResponse = await fetch(`${API_BASE_URL}/api/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                title: `테스트 게시글 ${new Date().toLocaleString('ko-KR')}`,
                content: '이것은 API를 통해 DB에 저장되는지 테스트하는 게시글입니다.',
            }),
        });

        const postData = (await postResponse.json()) as PostResponse;

        if (!postResponse.ok) {
            console.error('❌ 게시글 작성 실패:', postData);
            return;
        }

        console.log('✅ 게시글 작성 성공');
        console.log(`   게시글 ID: ${postData.data.id}`);
        console.log(`   제목: ${postData.data.title}\n`);

        // 3. 게시글 목록 조회
        console.log('3️⃣  게시글 목록 조회...');
        const listResponse = await fetch(`${API_BASE_URL}/api/posts?page=1&limit=10`);
        const listData = (await listResponse.json()) as PostsListResponse;

        if (!listResponse.ok) {
            console.error('❌ 게시글 목록 조회 실패:', listData);
            return;
        }

        console.log('✅ 게시글 목록 조회 성공');
        console.log(`   전체 게시글 수: ${listData.data.total}`);
        console.log(`   현재 페이지 게시글 수: ${listData.data.posts.length}\n`);

        // 4. 방금 작성한 게시글이 목록에 있는지 확인
        const foundPost = listData.data.posts.find((p) => p.id === postData.data.id);
        if (foundPost) {
            console.log('✅ 방금 작성한 게시글이 목록에 있습니다!');
            console.log(`   제목: ${foundPost.title}`);
        } else {
            console.log('⚠️  방금 작성한 게시글이 목록에 없습니다.');
        }

        console.log('\n🎉 API 테스트 완료!');
        console.log('\n💡 Supabase 대시보드에서 posts 테이블을 확인해보세요:');
        console.log('   https://supabase.com/dashboard/project/[프로젝트참조]/editor');

    } catch (error) {
        console.error('❌ 테스트 중 에러 발생:');
        if (error instanceof Error) {
            console.error('에러 메시지:', error.message);
        } else {
            console.error(error);
        }
    }
}

// 서버가 실행 중인지 확인
async function checkServer() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (response.ok) {
            return true;
        }
    } catch (error) {
        return false;
    }
    return false;
}

async function main() {
    console.log('🔍 서버 상태 확인 중...');
    const serverRunning = await checkServer();

    if (!serverRunning) {
        console.error('❌ 서버가 실행 중이 아닙니다.');
        console.error('다음 명령어로 서버를 시작하세요:');
        console.error('   cd apps/backend && npm run dev');
        process.exit(1);
    }

    console.log('✅ 서버가 실행 중입니다.\n');
    await testPostAPI();
}

main();
