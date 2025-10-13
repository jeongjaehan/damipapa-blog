# Design Document

## Overview

개인 블로그 플랫폼은 **Next.js 15 풀스택 웹 애플리케이션**입니다. Next.js API Routes를 사용하여 프론트엔드와 백엔드를 하나의 프로젝트로 통합했습니다. Prisma ORM으로 MySQL 데이터베이스를 관리하고, JWT 기반 인증을 사용하며, shadcn/ui와 Medium/Notion 스타일의 현대적인 디자인을 적용했습니다. 댓글은 Facebook Comments 플러그인을 사용합니다.

## Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph "Frontend (Port 3000)"
        A[Next.js App] --> B[React Components]
        B --> C[API Client]
        C --> D[State Management]
    end
    
    subgraph "Backend (Port 8080)"
        E[Spring Boot API] --> F[Controllers]
        F --> G[Services]
        G --> H[Repositories]
        H --> I[Database]
    end
    
    subgraph "External Services"
        J[File Storage]
        K[Email Service]
    end
    
    C --> |HTTP/REST| F
    G --> J
    G --> K
```

### System Components

#### Backend Architecture (Spring Boot)
```mermaid
graph TB
    A[REST Controllers] --> B[Service Layer]
    B --> C[Repository Layer]
    C --> D[JPA Entities]
    D --> E[MySQL Database]
    
    F[Security Config] --> G[JWT Filter]
    G --> A
    
    H[File Upload Service] --> I[Local Storage]
    B --> H
```

#### Frontend Architecture (Next.js)
```mermaid
graph TB
    A[Next.js Pages] --> B[React Components]
    B --> C[Custom Hooks]
    C --> D[API Services]
    D --> E[Axios HTTP Client]
    
    F[Context Providers] --> G[Auth Context]
    F --> H[Theme Context]
    
    B --> F
```

### Directory Structure

#### Backend Structure
```
blog-backend/
├── src/main/java/com/blog/
│   ├── config/           # 설정 클래스들
│   │   ├── SecurityConfig.java
│   │   ├── CorsConfig.java
│   │   └── JwtConfig.java
│   ├── controller/       # REST 컨트롤러들
│   │   ├── AuthController.java
│   │   ├── PostController.java
│   │   ├── CommentController.java
│   │   └── FileController.java
│   ├── service/          # 비즈니스 로직
│   │   ├── AuthService.java
│   │   ├── PostService.java
│   │   ├── CommentService.java
│   │   └── FileService.java
│   ├── repository/       # 데이터 접근 계층
│   │   ├── UserRepository.java
│   │   ├── PostRepository.java
│   │   └── CommentRepository.java
│   ├── entity/           # JPA 엔티티들
│   │   ├── User.java
│   │   ├── Post.java
│   │   ├── Comment.java
│   │   └── Tag.java
│   ├── dto/              # 데이터 전송 객체들
│   │   ├── request/
│   │   └── response/
│   ├── security/         # 보안 관련 클래스들
│   │   ├── JwtTokenProvider.java
│   │   └── JwtAuthenticationFilter.java
│   └── util/             # 유틸리티 클래스들
├── src/main/resources/
│   ├── application.yml   # 애플리케이션 설정
│   └── data.sql         # 초기 데이터
├── build.gradle         # Gradle 빌드 설정
└── uploads/             # 업로드된 파일들
```

#### Frontend Structure
```
blog-frontend/
├── pages/               # Next.js 페이지들
│   ├── index.js        # 홈페이지
│   ├── posts/          # 포스트 관련 페이지들
│   ├── admin/          # 관리자 페이지들
│   └── auth/           # 인증 페이지들
├── components/          # 재사용 가능한 컴포넌트들
│   ├── common/         # 공통 컴포넌트들
│   ├── post/           # 포스트 관련 컴포넌트들
│   └── admin/          # 관리자 컴포넌트들
├── hooks/              # 커스텀 React 훅들
├── services/           # API 서비스들
├── contexts/           # React Context들
├── styles/             # CSS/SCSS 스타일들
├── utils/              # 유틸리티 함수들
├── public/             # 정적 파일들
├── package.json        # npm 의존성
└── next.config.js      # Next.js 설정
```

## Components and Interfaces

### Backend Components (Spring Boot)

#### 1. REST Controllers

```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request);
    
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader("Authorization") String token);
    
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@RequestHeader("Authorization") String token);
}

@RestController
@RequestMapping("/api/posts")
public class PostController {
    @GetMapping
    public ResponseEntity<PageResponse<PostSummaryResponse>> getPosts(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(required = false) String tag,
        @RequestParam(required = false) String category
    );
    
    @GetMapping("/{id}")
    public ResponseEntity<PostDetailResponse> getPost(@PathVariable Long id);
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PostResponse> createPost(@RequestBody CreatePostRequest request);
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PostResponse> updatePost(@PathVariable Long id, @RequestBody UpdatePostRequest request);
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePost(@PathVariable Long id);
}
```

#### 2. Service Layer

```java
@Service
@Transactional
public class PostService {
    public Page<Post> getPosts(Pageable pageable, String tag, String category);
    public Post getPostById(Long id);
    public Post createPost(CreatePostRequest request, User author);
    public Post updatePost(Long id, UpdatePostRequest request);
    public void deletePost(Long id);
    public List<String> getAllTags();
    public List<String> getAllCategories();
}

@Service
@Transactional
public class CommentService {
    public List<Comment> getCommentsByPostId(Long postId);
    public Comment createComment(Long postId, CreateCommentRequest request);
    public void deleteComment(Long id);
    public void approveComment(Long id);
}
```

#### 3. Repository Layer

```java
@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    Page<Post> findByPublishedTrueOrderByCreatedAtDesc(Pageable pageable);
    Page<Post> findByTagsContainingAndPublishedTrueOrderByCreatedAtDesc(String tag, Pageable pageable);
    Page<Post> findByCategoryAndPublishedTrueOrderByCreatedAtDesc(String category, Pageable pageable);
    
    @Query("SELECT DISTINCT t FROM Post p JOIN p.tags t WHERE p.published = true")
    List<String> findAllDistinctTags();
    
    @Query("SELECT DISTINCT p.category FROM Post p WHERE p.published = true AND p.category IS NOT NULL")
    List<String> findAllDistinctCategories();
}

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostIdAndApprovedTrueOrderByCreatedAtAsc(Long postId);
    List<Comment> findByApprovedFalseOrderByCreatedAtDesc();
}
```

### Frontend Components (React/Next.js)

#### 1. Page Components

```typescript
// pages/index.tsx
interface HomePageProps {
  posts: PostSummary[]
  totalPages: number
  currentPage: number
}

export default function HomePage({ posts, totalPages, currentPage }: HomePageProps) {
  return (
    <Layout>
      <PostList posts={posts} />
      <Pagination totalPages={totalPages} currentPage={currentPage} />
    </Layout>
  )
}

// pages/posts/[id].tsx
interface PostPageProps {
  post: PostDetail
  comments: Comment[]
}

export default function PostPage({ post, comments }: PostPageProps) {
  return (
    <Layout>
      <PostDetail post={post} />
      <CommentSection comments={comments} postId={post.id} />
    </Layout>
  )
}
```

#### 2. React Components

```typescript
// components/post/PostList.tsx
interface PostListProps {
  posts: PostSummary[]
}

export const PostList: React.FC<PostListProps> = ({ posts }) => {
  return (
    <div className="post-list">
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}

// components/admin/PostEditor.tsx
interface PostEditorProps {
  post?: Post
  onSave: (post: CreatePostRequest | UpdatePostRequest) => void
}

export const PostEditor: React.FC<PostEditorProps> = ({ post, onSave }) => {
  const [title, setTitle] = useState(post?.title || '')
  const [content, setContent] = useState(post?.content || '')
  const [tags, setTags] = useState(post?.tags || [])
  
  return (
    <form onSubmit={handleSubmit}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} />
      <MarkdownEditor value={content} onChange={setContent} />
      <TagInput tags={tags} onChange={setTags} />
      <button type="submit">Save</button>
    </form>
  )
}
```

#### 3. API Services

```typescript
// services/api.ts
class ApiService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
  
  async getPosts(page = 0, size = 10, tag?: string, category?: string): Promise<PageResponse<PostSummary>> {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() })
    if (tag) params.append('tag', tag)
    if (category) params.append('category', category)
    
    const response = await fetch(`${this.baseURL}/posts?${params}`)
    return response.json()
  }
  
  async getPost(id: number): Promise<PostDetail> {
    const response = await fetch(`${this.baseURL}/posts/${id}`)
    return response.json()
  }
  
  async createPost(post: CreatePostRequest): Promise<Post> {
    const response = await fetch(`${this.baseURL}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify(post)
    })
    return response.json()
  }
}
```

#### 4. Custom Hooks

```typescript
// hooks/useAuth.ts
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  const login = async (email: string, password: string) => {
    const response = await apiService.login({ email, password })
    localStorage.setItem('token', response.token)
    setUser(response.user)
  }
  
  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }
  
  return { user, loading, login, logout }
}

// hooks/usePosts.ts
export const usePosts = (page = 0, tag?: string, category?: string) => {
  const [posts, setPosts] = useState<PostSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(0)
  
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      const response = await apiService.getPosts(page, 10, tag, category)
      setPosts(response.content)
      setTotalPages(response.totalPages)
      setLoading(false)
    }
    
    fetchPosts()
  }, [page, tag, category])
  
  return { posts, loading, totalPages }
}
```

## Data Models

### Backend Entities (JPA)

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String name;
    
    private String bio;
    
    @Enumerated(EnumType.STRING)
    private Role role = Role.USER;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

@Entity
@Table(name = "posts")
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    @Column(columnDefinition = "TEXT")
    private String excerpt;
    
    private String category;
    
    @ElementCollection
    @CollectionTable(name = "post_tags")
    private Set<String> tags = new HashSet<>();
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private User author;
    
    private boolean published = false;
    
    @Column(nullable = false)
    private long viewCount = 0;  // 조회수 추가
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();
    
    public void incrementViewCount() {
        this.viewCount++;
    }
}

@Entity
@Table(name = "post_views")
public class PostView {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private Post post;
    
    @Column(nullable = false)
    private String ipAddress;
    
    @CreationTimestamp
    private LocalDateTime viewedAt;
}

@Entity
@Table(name = "comments")
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String authorName;
    
    @Column(nullable = false)
    private String authorEmail;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private Post post;
    
    private boolean approved = false;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
}
```

### DTOs (Data Transfer Objects)

#### Request DTOs

```java
public class LoginRequest {
    @NotBlank
    @Email
    private String email;
    
    @NotBlank
    @Size(min = 6)
    private String password;
}

public class CreatePostRequest {
    @NotBlank
    @Size(max = 200)
    private String title;
    
    @NotBlank
    private String content;
    
    private String excerpt;
    private String category;
    private Set<String> tags = new HashSet<>();
    private boolean published = false;
}

public class CreateCommentRequest {
    @NotBlank
    @Size(max = 100)
    private String authorName;
    
    @NotBlank
    @Email
    private String authorEmail;
    
    @NotBlank
    @Size(max = 1000)
    private String content;
}
```

#### Response DTOs

```java
public class LoginResponse {
    private String token;
    private UserResponse user;
}

public class PostSummaryResponse {
    private Long id;
    private String title;
    private String excerpt;
    private String category;
    private Set<String> tags;
    private String authorName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int commentCount;
    private long viewCount;  // 조회수 추가
}

public class PostDetailResponse {
    private Long id;
    private String title;
    private String content;
    private String excerpt;
    private String category;
    private Set<String> tags;
    private UserResponse author;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<CommentResponse> comments;
    private long viewCount;  // 조회수 추가
}

public class PageResponse<T> {
    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean first;
    private boolean last;
}
```

### Frontend Types (TypeScript)

```typescript
interface User {
  id: number
  email: string
  name: string
  bio?: string
  role: 'USER' | 'ADMIN'
  createdAt: string
  updatedAt: string
}

interface PostSummary {
  id: number
  title: string
  excerpt: string
  category?: string
  tags: string[]
  authorName: string
  createdAt: string
  updatedAt: string
  commentCount: number
  viewCount: number  // 조회수 추가
}

interface PostDetail {
  id: number
  title: string
  content: string
  excerpt: string
  category?: string
  tags: string[]
  author: User
  createdAt: string
  updatedAt: string
  comments: Comment[]
  viewCount: number  // 조회수 추가
}

interface Comment {
  id: number
  authorName: string
  authorEmail: string
  content: string
  createdAt: string
  approved: boolean
}

interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

interface CreatePostRequest {
  title: string
  content: string
  excerpt?: string
  category?: string
  tags: string[]
  published: boolean
}

interface LoginRequest {
  email: string
  password: string
}
```

## Error Handling

### Backend Error Handling

#### Global Exception Handler

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidation(ValidationException ex) {
        return ResponseEntity.badRequest()
            .body(new ErrorResponse("VALIDATION_ERROR", ex.getMessage()));
    }
    
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity.notFound()
            .build();
    }
    
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(UnauthorizedException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(new ErrorResponse("UNAUTHORIZED", "Authentication required"));
    }
    
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(new ErrorResponse("ACCESS_DENIED", "Insufficient permissions"));
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ErrorResponse("INTERNAL_ERROR", "An unexpected error occurred"));
    }
}

public class ErrorResponse {
    private String code;
    private String message;
    private LocalDateTime timestamp = LocalDateTime.now();
}
```

#### Custom Exceptions

```java
public class EntityNotFoundException extends RuntimeException {
    public EntityNotFoundException(String entityName, Long id) {
        super(String.format("%s with id %d not found", entityName, id));
    }
}

public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}

public class ValidationException extends RuntimeException {
    public ValidationException(String message) {
        super(message);
    }
}
```

### Frontend Error Handling

#### Error Boundary Component

```typescript
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props)
    this.state = { hasError: false }
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>We're sorry, but something unexpected happened.</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      )
    }
    
    return this.props.children
  }
}
```

#### API Error Handling

```typescript
class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message)
  }
}

class ApiService {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(
        response.status,
        errorData.code || 'UNKNOWN_ERROR',
        errorData.message || 'An error occurred'
      )
    }
    
    return response.json()
  }
  
  async getPosts(page = 0, size = 10): Promise<PageResponse<PostSummary>> {
    try {
      const response = await fetch(`${this.baseURL}/posts?page=${page}&size=${size}`)
      return this.handleResponse(response)
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(0, 'NETWORK_ERROR', 'Network connection failed')
    }
  }
}
```

### Error Handling Strategy

1. **Authentication Errors**: JWT 토큰 만료 시 자동 로그아웃 및 로그인 페이지 리다이렉트
2. **Validation Errors**: 폼 입력 검증 실패 시 필드별 오류 메시지 표시
3. **Network Errors**: 네트워크 연결 실패 시 재시도 옵션 제공
4. **Authorization Errors**: 권한 부족 시 적절한 안내 메시지와 대안 제시
5. **Server Errors**: 서버 오류 시 사용자 친화적 메시지와 지원 연락처 제공
6. **Client Errors**: JavaScript 오류 시 Error Boundary로 캐치하여 앱 크래시 방지

## Testing Strategy

### Backend Testing (Spring Boot)

#### Unit Testing

```java
@ExtendWith(MockitoExtension.class)
class PostServiceTest {
    
    @Mock
    private PostRepository postRepository;
    
    @InjectMocks
    private PostService postService;
    
    @Test
    void shouldCreatePost() {
        // Given
        CreatePostRequest request = new CreatePostRequest();
        request.setTitle("Test Post");
        request.setContent("Test content");
        
        User author = new User();
        author.setId(1L);
        
        Post savedPost = new Post();
        savedPost.setId(1L);
        savedPost.setTitle("Test Post");
        
        when(postRepository.save(any(Post.class))).thenReturn(savedPost);
        
        // When
        Post result = postService.createPost(request, author);
        
        // Then
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getTitle()).isEqualTo("Test Post");
    }
}

@ExtendWith(MockitoExtension.class)
class CommentServiceTest {
    
    @Mock
    private CommentRepository commentRepository;
    
    @Mock
    private PostRepository postRepository;
    
    @InjectMocks
    private CommentService commentService;
    
    @Test
    void shouldCreateComment() {
        // Given
        Long postId = 1L;
        CreateCommentRequest request = new CreateCommentRequest();
        request.setAuthorName("John Doe");
        request.setAuthorEmail("john@example.com");
        request.setContent("Great post!");
        
        Post post = new Post();
        post.setId(postId);
        
        when(postRepository.findById(postId)).thenReturn(Optional.of(post));
        when(commentRepository.save(any(Comment.class))).thenAnswer(i -> i.getArgument(0));
        
        // When
        Comment result = commentService.createComment(postId, request);
        
        // Then
        assertThat(result.getAuthorName()).isEqualTo("John Doe");
        assertThat(result.getContent()).isEqualTo("Great post!");
    }
}
```

#### Integration Testing

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class PostControllerIntegrationTest {
    
    @Container
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0")
            .withDatabaseName("blog_test")
            .withUsername("test")
            .withPassword("test");
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Autowired
    private PostRepository postRepository;
    
    @Test
    void shouldGetPosts() {
        // Given
        Post post = new Post();
        post.setTitle("Test Post");
        post.setContent("Test content");
        post.setPublished(true);
        postRepository.save(post);
        
        // When
        ResponseEntity<PageResponse> response = restTemplate.getForEntity(
            "/api/posts", PageResponse.class);
        
        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getTotalElements()).isEqualTo(1);
    }
}
```

### Frontend Testing (React/Next.js)

#### Component Testing

```typescript
// __tests__/components/PostList.test.tsx
import { render, screen } from '@testing-library/react'
import { PostList } from '@/components/post/PostList'

const mockPosts: PostSummary[] = [
  {
    id: 1,
    title: 'Test Post',
    excerpt: 'Test excerpt',
    tags: ['test'],
    authorName: 'John Doe',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    commentCount: 0
  }
]

describe('PostList', () => {
  it('renders posts correctly', () => {
    render(<PostList posts={mockPosts} />)
    
    expect(screen.getByText('Test Post')).toBeInTheDocument()
    expect(screen.getByText('Test excerpt')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })
  
  it('renders empty state when no posts', () => {
    render(<PostList posts={[]} />)
    
    expect(screen.getByText('No posts found')).toBeInTheDocument()
  })
})
```

#### Hook Testing

```typescript
// __tests__/hooks/useAuth.test.ts
import { renderHook, act } from '@testing-library/react'
import { useAuth } from '@/hooks/useAuth'

// Mock API service
jest.mock('@/services/api', () => ({
  apiService: {
    login: jest.fn(),
    getCurrentUser: jest.fn()
  }
}))

describe('useAuth', () => {
  it('should login successfully', async () => {
    const { result } = renderHook(() => useAuth())
    
    const mockUser = { id: 1, email: 'test@example.com', name: 'Test User' }
    const mockResponse = { token: 'mock-token', user: mockUser }
    
    ;(apiService.login as jest.Mock).mockResolvedValue(mockResponse)
    
    await act(async () => {
      await result.current.login('test@example.com', 'password')
    })
    
    expect(result.current.user).toEqual(mockUser)
  })
})
```

#### E2E Testing (Cypress)

```typescript
// cypress/e2e/blog.cy.ts
describe('Blog Application', () => {
  beforeEach(() => {
    cy.visit('/')
  })
  
  it('should display posts on homepage', () => {
    cy.get('[data-testid="post-list"]').should('exist')
    cy.get('[data-testid="post-card"]').should('have.length.at.least', 1)
  })
  
  it('should navigate to post detail', () => {
    cy.get('[data-testid="post-card"]').first().click()
    cy.url().should('include', '/posts/')
    cy.get('[data-testid="post-content"]').should('exist')
  })
  
  it('should allow admin to create post', () => {
    // Login as admin
    cy.visit('/auth/login')
    cy.get('[data-testid="email-input"]').type('admin@example.com')
    cy.get('[data-testid="password-input"]').type('password')
    cy.get('[data-testid="login-button"]').click()
    
    // Create new post
    cy.visit('/admin/posts/new')
    cy.get('[data-testid="title-input"]').type('New Test Post')
    cy.get('[data-testid="content-editor"]').type('This is a test post content')
    cy.get('[data-testid="save-button"]').click()
    
    // Verify post was created
    cy.url().should('include', '/admin/posts')
    cy.contains('New Test Post').should('exist')
  })
})
```

### Performance Testing

#### Backend Performance

```java
@Test
@Timeout(value = 2, unit = TimeUnit.SECONDS)
void shouldGetPostsWithinTimeLimit() {
    // Create 1000 test posts
    List<Post> posts = IntStream.range(0, 1000)
        .mapToObj(i -> createTestPost("Post " + i))
        .collect(Collectors.toList());
    postRepository.saveAll(posts);
    
    // Test pagination performance
    Pageable pageable = PageRequest.of(0, 20);
    Page<Post> result = postService.getPosts(pageable, null, null);
    
    assertThat(result.getContent()).hasSize(20);
}
```

#### Frontend Performance

```typescript
// __tests__/performance/PostList.performance.test.tsx
import { render } from '@testing-library/react'
import { PostList } from '@/components/post/PostList'

describe('PostList Performance', () => {
  it('should render 100 posts within performance budget', () => {
    const largePosts = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      title: `Post ${i}`,
      excerpt: `Excerpt ${i}`,
      tags: [`tag${i}`],
      authorName: 'Author',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      commentCount: 0
    }))
    
    const startTime = performance.now()
    render(<PostList posts={largePosts} />)
    const endTime = performance.now()
    
    expect(endTime - startTime).toBeLessThan(100) // Should render within 100ms
  })
})
```

## Implementation Notes

### Technology Stack

#### Fullstack (실제 구현됨)
- **Framework**: Next.js 15.5.4 (풀스택)
- **Language**: TypeScript
- **Database**: MySQL 8.0 (tmpfs)
- **ORM**: Prisma
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **Styling**: Tailwind CSS + shadcn/ui
- **UI Kit**: shadcn/ui (Radix UI 기반)
- **Icons**: Lucide React
- **Markdown**: react-markdown + remark-gfm
- **Comments**: Facebook Comments Plugin
- **File Upload**: Next.js API Routes + multer

### 구현된 주요 기능

#### 조회수 시스템
- **PostView 모델**: IP 주소 기반 조회 기록 저장
- **유니크 조회수**: 같은 IP에서는 중복 카운트 방지
- **통계**: 관리자 대시보드에 총 조회수 표시

#### 댓글 시스템
- **Facebook Comments**: 소셜 댓글 플러그인 사용
- **관리**: Facebook Moderation Tool
- **장점**: 스팸 방지, 소셜 통합

#### 디자인 시스템
- **shadcn/ui**: 모던한 컴포넌트 라이브러리
- **Medium/Notion 스타일**: 읽기 최적화 타이포그래피
- **색상**: Indigo/Slate 전문 팔레트
- **애니메이션**: 호버 스케일, 부드러운 전환

### Performance Optimizations

#### Backend Optimizations
1. **Database Indexing**: 자주 조회되는 컬럼에 인덱스 설정
2. **Query Optimization**: N+1 문제 해결을 위한 fetch join 사용
3. **Caching**: Spring Cache로 자주 조회되는 데이터 캐싱
4. **Pagination**: 대량 데이터 조회 시 페이지네이션 적용
5. **Connection Pooling**: HikariCP로 데이터베이스 연결 풀 최적화

#### Frontend Optimizations
1. **Code Splitting**: Next.js 자동 코드 분할
2. **Image Optimization**: Next.js Image 컴포넌트 사용
3. **Static Generation**: 정적 페이지는 SSG 적용
4. **Lazy Loading**: 컴포넌트 지연 로딩
5. **Bundle Analysis**: webpack-bundle-analyzer로 번들 크기 최적화

### Security Considerations

#### Backend Security
1. **Authentication**: JWT 토큰 기반 인증
2. **Authorization**: 역할 기반 접근 제어 (RBAC)
3. **Input Validation**: Bean Validation으로 입력 검증
4. **SQL Injection**: JPA 사용으로 SQL 인젝션 방지
5. **CORS**: 프론트엔드 도메인만 허용하는 CORS 설정
6. **Rate Limiting**: API 호출 빈도 제한
7. **File Upload**: 파일 타입 및 크기 제한

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/api/posts/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/comments/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

#### Frontend Security
1. **XSS Prevention**: 사용자 입력 콘텐츠 sanitization
2. **CSRF Protection**: API 요청 시 CSRF 토큰 포함
3. **Secure Storage**: JWT 토큰을 httpOnly 쿠키에 저장
4. **Content Security Policy**: CSP 헤더로 XSS 공격 방지
5. **Input Sanitization**: DOMPurify로 HTML 콘텐츠 정화

```typescript
// utils/sanitize.ts
import DOMPurify from 'dompurify'

export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'code', 'pre', 'blockquote'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class']
  })
}
```

### Database Schema (Prisma + MySQL)

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  name      String
  bio       String?  @db.Text
  role      String   @default("USER")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  posts     Post[]
  
  @@map("users")
}

model Post {
  id        Int        @id @default(autoincrement())
  title     String     @db.VarChar(200)
  content   String     @db.LongText
  excerpt   String?    @db.Text
  category  String?    @db.VarChar(100)
  tags      String?    @db.Text  // JSON stringified
  published Boolean    @default(false)
  viewCount Int        @default(0)
  authorId  Int
  author    User       @relation(fields: [authorId], references: [id])
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  postViews PostView[]
  
  @@map("posts")
}

model PostView {
  id        Int      @id @default(autoincrement())
  postId    Int
  ipAddress String   @db.VarChar(50)
  viewedAt  DateTime @default(now())
  post      Post     @relation(fields: [postId], references: [id])
  
  @@unique([postId, ipAddress])
  @@map("post_views")
}
```

**Note:** 댓글(Comment) 테이블은 제거되었습니다. Facebook Comments를 사용합니다.

### Deployment Configuration

#### Environment Variables (.env) - 실제 구현
```env
# Database Configuration
MYSQL_ROOT_PASSWORD=your_root_password_here
MYSQL_DATABASE=blog
MYSQL_USER=blog_user
MYSQL_PASSWORD=your_database_password_here
DATABASE_URL="mysql://blog_user:your_password@localhost:3307/blog"

# JWT Configuration
JWT_SECRET=your_base64_encoded_jwt_secret_here

# Admin Account
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_password_here
ADMIN_NAME=관리자

# Facebook App
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id_here
```

**주의**: `.env` 파일은 Git에 커밋하지 마세요! `.env.example` 파일을 복사하여 실제 값으로 설정하세요.

#### Frontend (next.config.js)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  },
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
```