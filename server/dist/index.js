"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const cors_1 = __importDefault(require("cors"));
const crypto_1 = require("crypto");
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
const port = Number(process.env.PORT ?? 4000);
const jwtSecret = process.env.JWT_SECRET ?? 'digital-farm-lab-dev-secret';
const appBaseUrl = process.env.APP_BASE_URL ?? 'http://localhost:19006';
app.disable('x-powered-by');
app.use((0, cors_1.default)({ origin: true, credentials: true }));
app.use(express_1.default.json({ limit: '1mb' }));
const registerSchema = zod_1.z.object({
    firstName: zod_1.z.string().trim().min(2),
    lastName: zod_1.z.string().trim().min(2),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    role: zod_1.z.enum(['LEARNER', 'TRAINER']),
    acceptTerms: zod_1.z.boolean().optional(),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
});
const emailSchema = zod_1.z.object({ email: zod_1.z.string().email() });
const resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(10),
    password: zod_1.z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
});
const rateLimitStore = new Map();
const rateLimit = (key, maxRequests = 5, windowMs = 60_000) => {
    return (req, res, next) => {
        const ip = req.ip ?? 'unknown';
        const cacheKey = `${key}:${ip}`;
        const now = Date.now();
        const current = rateLimitStore.get(cacheKey);
        if (!current || current.resetAt < now) {
            rateLimitStore.set(cacheKey, { count: 1, resetAt: now + windowMs });
            return next();
        }
        if (current.count >= maxRequests) {
            return res.status(429).json({ message: 'Too many requests. Please wait a moment and try again.' });
        }
        current.count += 1;
        return next();
    };
};
const hashToken = (token) => (0, crypto_1.createHash)('sha256').update(token).digest('hex');
const createToken = (user) => jsonwebtoken_1.default.sign({ sub: user.id, email: user.email, role: user.role }, jwtSecret, { expiresIn: '7d' });
async function sendEmail({ to, subject, html, text, }) {
    const provider = (process.env.EMAIL_PROVIDER ?? '').toLowerCase();
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM ?? 'no-reply@digitalfarmlab.local';
    if (provider !== 'resend' || !apiKey) {
        console.warn(`Email provider not configured. Skipped sending email to ${to}.`);
        return { ok: false, reason: 'EMAIL_PROVIDER_NOT_CONFIGURED' };
    }
    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from,
            to: [to],
            subject,
            html,
            text,
        }),
    });
    if (!response.ok) {
        const details = await response.text();
        throw new Error(`Resend email failed: ${details}`);
    }
    return { ok: true };
}
async function createVerificationToken(userId) {
    const token = (0, crypto_1.randomBytes)(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
    const tokenHash = hashToken(token);
    await prisma.verificationToken.deleteMany({ where: { userId, type: 'EMAIL_VERIFICATION' } });
    await prisma.verificationToken.create({
        data: {
            userId,
            tokenHash,
            type: 'EMAIL_VERIFICATION',
            expiresAt,
        },
    });
    return token;
}
async function createPasswordResetToken(userId) {
    const token = (0, crypto_1.randomBytes)(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);
    const tokenHash = hashToken(token);
    await prisma.passwordResetToken.deleteMany({ where: { userId } });
    await prisma.passwordResetToken.create({
        data: {
            userId,
            tokenHash,
            expiresAt,
        },
    });
    return token;
}
const authenticate = async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    try {
        const token = header.replace('Bearer ', '');
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        const sessionRecord = await prisma.session.findFirst({
            where: {
                userId: decoded.sub,
                tokenHash: hashToken(token),
                revokedAt: null,
                expiresAt: {
                    gt: new Date(),
                },
            },
        });
        if (!sessionRecord) {
            return res.status(401).json({ message: 'Session expired' });
        }
        const user = await prisma.user.findUnique({
            where: { id: decoded.sub },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                status: true,
            },
        });
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        req.user = { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName };
        return next();
    }
    catch {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        const role = req.user?.role;
        if (!role || !allowedRoles.includes(role)) {
            return res.status(403).json({ message: 'Access denied for this account role' });
        }
        return next();
    };
};
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'digital-farm-lab-server' });
});
app.post('/api/auth/register', rateLimit('auth-register'), async (req, res) => {
    try {
        const parsed = registerSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: 'Please provide a valid name, email, password and account type.' });
        }
        const { firstName, lastName, email, password, role, acceptTerms } = parsed.data;
        if (acceptTerms === false) {
            return res.status(400).json({ message: 'You must accept the terms and conditions.' });
        }
        const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (existingUser) {
            return res.status(409).json({ message: 'An account with this email address already exists.' });
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                passwordHash,
                firstName,
                lastName,
                role,
                status: 'PENDING_VERIFICATION',
            },
        });
        const token = await createVerificationToken(user.id);
        const verificationUrl = `${appBaseUrl}/auth/verify-email?token=${encodeURIComponent(token)}`;
        try {
            const emailResult = await sendEmail({
                to: user.email,
                subject: 'Verify Your Digital Farm Lab Account',
                html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #183e2e;">
            <h2>Welcome to Digital Farm Lab!</h2>
            <p>Thank you for joining our agricultural learning platform.</p>
            <p>Please verify your email address to activate your account.</p>
            <p><a href="${verificationUrl}" style="display:inline-block;background:#236B45;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;">Verify Email</a></p>
            <p>This verification link expires in 24 hours.</p>
            <p>Welcome to Digital Farm Lab.</p>
          </div>
        `,
                text: `Welcome to Digital Farm Lab! Please verify your email address: ${verificationUrl}`,
            });
            if (!emailResult.ok) {
                return res.status(202).json({
                    message: 'Account created but verification email could not be delivered. Please contact support or request a new verification email.',
                    user: {
                        id: user.id,
                        email: user.email,
                        role: user.role,
                    },
                });
            }
        }
        catch (emailError) {
            console.error('Verification email delivery failed', emailError);
            return res.status(202).json({
                message: 'Account created but verification email could not be delivered. Please contact support or request a new verification email.',
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                },
            });
        }
        return res.status(201).json({
            message: 'Account created successfully. Please check your inbox to verify your email.',
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error('REGISTER_ERROR', error);
        return res.status(500).json({ message: 'Unable to create account right now.' });
    }
});
app.post('/api/auth/verify-email', rateLimit('auth-verify-email'), async (req, res) => {
    try {
        const parsed = zod_1.z.object({ token: zod_1.z.string().min(10) }).safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: 'A valid verification token is required.' });
        }
        const tokenHash = hashToken(parsed.data.token);
        const record = await prisma.verificationToken.findFirst({
            where: {
                tokenHash,
                type: 'EMAIL_VERIFICATION',
                usedAt: null,
            },
            include: { user: true },
        });
        if (!record) {
            return res.status(400).json({ message: 'Invalid or expired verification token.' });
        }
        if (record.expiresAt < new Date()) {
            await prisma.verificationToken.delete({ where: { id: record.id } });
            return res.status(410).json({ message: 'This verification link has expired.' });
        }
        if (record.user.emailVerifiedAt) {
            await prisma.verificationToken.update({ where: { id: record.id }, data: { usedAt: new Date() } });
            return res.status(200).json({ message: 'This account is already verified.' });
        }
        await prisma.$transaction([
            prisma.user.update({
                where: { id: record.userId },
                data: { status: 'VERIFIED', emailVerifiedAt: new Date() },
            }),
            prisma.verificationToken.update({
                where: { id: record.id },
                data: { usedAt: new Date() },
            }),
        ]);
        return res.json({ message: 'Email verified successfully. You can now sign in.' });
    }
    catch (error) {
        console.error('VERIFY_EMAIL_ERROR', error);
        return res.status(500).json({ message: 'Unable to verify email address.' });
    }
});
app.post('/api/auth/resend-verification', rateLimit('auth-resend-verification'), async (req, res) => {
    try {
        const parsed = emailSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: 'A valid email address is required.' });
        }
        const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
        if (!user) {
            return res.status(200).json({ message: 'If an account exists, a verification email has been sent.' });
        }
        if (user.emailVerifiedAt) {
            return res.status(200).json({ message: 'This account is already verified.' });
        }
        const token = await createVerificationToken(user.id);
        const verificationUrl = `${appBaseUrl}/auth/verify-email?token=${encodeURIComponent(token)}`;
        try {
            const emailResult = await sendEmail({
                to: user.email,
                subject: 'Verify Your Digital Farm Lab Account',
                html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #183e2e;">
            <h2>Verify your email</h2>
            <p>Click below to complete registration for Digital Farm Lab.</p>
            <p><a href="${verificationUrl}" style="display:inline-block;background:#236B45;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;">Verify Email</a></p>
          </div>
        `,
                text: `Verify your email: ${verificationUrl}`,
            });
            if (!emailResult.ok) {
                return res.status(502).json({ message: 'Verification email could not be delivered. Please try again later or contact support.' });
            }
        }
        catch (emailError) {
            console.error('RESEND_VERIFICATION_EMAIL_ERROR', emailError);
            return res.status(502).json({ message: 'Verification email could not be delivered. Please try again later or contact support.' });
        }
        return res.status(200).json({ message: 'Verification email sent.' });
    }
    catch (error) {
        console.error('RESEND_VERIFICATION_ERROR', error);
        return res.status(500).json({ message: 'Unable to resend verification email.' });
    }
});
app.post('/api/auth/login', rateLimit('auth-login'), async (req, res) => {
    try {
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: 'Please provide your email and password.' });
        }
        const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
        const passwordMatches = await bcryptjs_1.default.compare(parsed.data.password, user.passwordHash);
        if (!passwordMatches) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
        if (user.status !== 'VERIFIED') {
            return res.status(403).json({ message: 'Please verify your email before signing in.' });
        }
        const token = createToken({ id: user.id, email: user.email, role: user.role });
        const tokenHash = hashToken(token);
        await prisma.session.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
            },
        });
        return res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error('LOGIN_ERROR', error);
        return res.status(500).json({ message: 'Unable to sign in right now.' });
    }
});
app.post('/api/auth/logout', authenticate, async (req, res) => {
    try {
        const authHeader = req.headers.authorization ?? '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : '';
        if (token) {
            const tokenHash = hashToken(token);
            await prisma.session.updateMany({
                where: {
                    userId: req.user.id,
                    tokenHash,
                    revokedAt: null,
                },
                data: { revokedAt: new Date() },
            });
        }
        return res.json({ message: 'Logged out successfully.' });
    }
    catch (error) {
        console.error('LOGOUT_ERROR', error);
        return res.status(500).json({ message: 'Unable to log out.' });
    }
});
app.get('/api/auth/me', authenticate, async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            status: true,
            emailVerifiedAt: true,
        },
    });
    return res.json({ user });
});
app.post('/api/auth/forgot-password', rateLimit('auth-forgot-password'), async (req, res) => {
    try {
        const parsed = emailSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: 'A valid email address is required.' });
        }
        const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
        if (!user) {
            return res.status(200).json({ message: 'If an account exists, a password reset email has been sent.' });
        }
        const token = await createPasswordResetToken(user.id);
        const resetLink = `${appBaseUrl}/auth/reset-password?token=${encodeURIComponent(token)}`;
        try {
            const emailResult = await sendEmail({
                to: user.email,
                subject: 'Reset Your Digital Farm Lab Password',
                html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #183e2e;"><h2>Password reset</h2><p>Use the link below to create a new password.</p><p><a href="${resetLink}" style="display:inline-block;background:#236B45;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;">Reset Password</a></p></div>`,
                text: `Reset your password: ${resetLink}`,
            });
            if (!emailResult.ok) {
                return res.status(502).json({ message: 'Password reset email could not be delivered. Please try again later or contact support.' });
            }
        }
        catch (emailError) {
            console.error('RESET_EMAIL_ERROR', emailError);
            return res.status(502).json({ message: 'Password reset email could not be delivered. Please try again later or contact support.' });
        }
        return res.status(200).json({ message: 'Password reset email sent.' });
    }
    catch (error) {
        console.error('FORGOT_PASSWORD_ERROR', error);
        return res.status(500).json({ message: 'Unable to process password reset request.' });
    }
});
app.post('/api/auth/reset-password', rateLimit('auth-reset-password'), async (req, res) => {
    try {
        const parsed = resetPasswordSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: 'A valid reset token and a strong new password are required.' });
        }
        const tokenHash = hashToken(parsed.data.token);
        const record = await prisma.passwordResetToken.findFirst({
            where: {
                tokenHash,
                usedAt: null,
            },
            include: { user: true },
        });
        if (!record) {
            return res.status(400).json({ message: 'Invalid or expired reset token.' });
        }
        if (record.expiresAt < new Date()) {
            await prisma.passwordResetToken.delete({ where: { id: record.id } });
            return res.status(410).json({ message: 'This reset link has expired.' });
        }
        const passwordHash = await bcryptjs_1.default.hash(parsed.data.password, 12);
        await prisma.$transaction([
            prisma.user.update({
                where: { id: record.userId },
                data: { passwordHash },
            }),
            prisma.passwordResetToken.update({
                where: { id: record.id },
                data: { usedAt: new Date() },
            }),
        ]);
        return res.json({ message: 'Password updated successfully. You can now sign in.' });
    }
    catch (error) {
        console.error('RESET_PASSWORD_ERROR', error);
        return res.status(500).json({ message: 'Unable to reset password.' });
    }
});
app.get('/api/learner/dashboard', authenticate, requireRole(['LEARNER']), async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, firstName: true, lastName: true },
    });
    const [lessonTotal, completedLessons, recentQuizAttempts, quizAggregate, progressRecords, openLessons] = await Promise.all([
        prisma.lesson.count(),
        prisma.learningProgress.count({ where: { userId: req.user.id, completed: true } }),
        prisma.quizAttempt.findMany({
            where: { userId: req.user.id },
            select: { score: true, submittedAt: true },
            orderBy: { submittedAt: 'desc' },
            take: 5,
        }),
        prisma.quizAttempt.aggregate({
            where: { userId: req.user.id },
            _avg: { score: true },
        }),
        prisma.learningProgress.findMany({
            where: { userId: req.user.id },
            include: { lesson: true },
            orderBy: { updatedAt: 'desc' },
            take: 3,
        }),
        prisma.lesson.findMany({
            where: { progress: { some: { userId: req.user.id, completed: false } } },
            select: { title: true },
            take: 3,
        }),
    ]);
    const learningProgress = lessonTotal > 0 ? Math.round((completedLessons / lessonTotal) * 100) : 0;
    const completedExperiments = await prisma.simulationRun.count({ where: { userId: req.user.id } });
    const assessmentScores = quizAggregate._avg.score === null ? undefined : Math.round(quizAggregate._avg.score);
    return res.json({
        name: `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Learner',
        role: 'LEARNER',
        learningProgress,
        activeSimulations: await prisma.simulationRun.count({ where: { userId: req.user.id } }),
        completedExperiments,
        completedLessons,
        assessmentScores,
        recentActivities: progressRecords.length > 0 ? progressRecords.map((entry) => `${entry.lesson?.title ?? 'Lesson'} ${entry.completed ? 'completed' : 'in progress'}`) : ['No learning activity yet'],
        recommendedActivities: openLessons.length > 0 ? openLessons.map((lesson) => `Continue ${lesson.title}`) : ['Complete your first lesson'],
    });
});
app.get('/api/trainer/dashboard', authenticate, requireRole(['TRAINER']), async (req, res) => {
    const trainer = await prisma.user.findUnique({ where: { id: req.user.id }, select: { id: true, firstName: true, lastName: true } });
    const [learnerSubmissions, activeAssignments, completedAssignments, pendingAssessments, averageScore, recentSubmissions] = await Promise.all([
        prisma.assignmentSubmission.findMany({
            where: { assignment: { trainerId: req.user.id } },
            select: { learnerId: true },
            distinct: ['learnerId'],
        }),
        prisma.assignment.count({ where: { trainerId: req.user.id } }),
        prisma.assignmentSubmission.count({ where: { assignment: { trainerId: req.user.id } } }),
        prisma.assignmentSubmission.count({
            where: { assignment: { trainerId: req.user.id }, score: null },
        }),
        prisma.assignmentSubmission.aggregate({
            where: { assignment: { trainerId: req.user.id } },
            _avg: { score: true },
        }),
        prisma.assignmentSubmission.findMany({
            where: { assignment: { trainerId: req.user.id } },
            include: { learner: true, assignment: true },
            orderBy: { submittedAt: 'desc' },
            take: 3,
        }),
    ]);
    const totalLearners = learnerSubmissions.length;
    return res.json({
        name: `${trainer?.firstName ?? 'Trainer'} ${trainer?.lastName ?? ''}`.trim(),
        role: 'TRAINER',
        totalLearners,
        activeLearningAssignments: activeAssignments,
        completedAssignments,
        pendingAssessments,
        learnerPerformance: averageScore._avg.score === null ? 'No scores yet' : `${Math.round(averageScore._avg.score)}%`,
        assessmentResults: averageScore._avg.score === null ? undefined : Math.round(averageScore._avg.score),
        recentActivities: recentSubmissions.length > 0 ? recentSubmissions.map((entry) => `${entry.assignment.title} reviewed`) : ['No learner submissions yet'],
    });
});
app.get('/api/dashboard', async (_req, res) => {
    const [farm, cropCount, simulationCount, userCount] = await Promise.all([
        prisma.farm.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { name: true, totalAreaHa: true },
        }),
        prisma.crop.count(),
        prisma.simulationRun.count(),
        prisma.user.count(),
    ]);
    const totalArea = farm ? `${farm.totalAreaHa} ha` : '0 ha';
    res.json({
        farmName: farm?.name ?? 'No farm assigned',
        totalArea,
        activeCrops: cropCount,
        activeSimulations: simulationCount,
        estimatedProductivity: farm ? 'Data available' : 'No data yet',
        healthScore: userCount > 0 ? 'Tracked' : 'No data yet',
        recentActivities: userCount > 0 ? ['Recent activity is recorded in the database'] : ['No recent activity yet'],
    });
});
app.get('/api/crops', (_req, res) => {
    res.json([
        { slug: 'maize', name: 'Maize', category: 'Cereals', scientificName: 'Zea mays', description: 'High-yield cereal crop well-suited to warm, productive growing systems.', climate: 'Warm temperate to tropical', soilRequirements: 'Well-drained loam', idealPh: '5.8 - 7.0', waterRequirements: 'Moderate to high, especially at flowering', temperature: '18°C - 32°C', growingSeason: '90 - 140 days', image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6' },
        { slug: 'tomatoes', name: 'Tomatoes', category: 'Vegetables', scientificName: 'Solanum lycopersicum', description: 'High-value fruiting crop with strong market demand and consistent irrigation needs.', climate: 'Warm and sunny', soilRequirements: 'Deep, fertile, well-drained soil', idealPh: '6.0 - 6.8', waterRequirements: 'Regular moisture with careful irrigation during fruit set', temperature: '18°C - 27°C', growingSeason: '70 - 110 days', image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337' },
        { slug: 'soybeans', name: 'Soybeans', category: 'Legumes', scientificName: 'Glycine max', description: 'Protein-rich legume crop known for nitrogen fixation and rotational value.', climate: 'Warm and humid', soilRequirements: 'Well-drained loam with neutral pH', idealPh: '6.0 - 7.0', waterRequirements: 'Moderate, critical during flowering and pod set', temperature: '20°C - 30°C', growingSeason: '90 - 130 days', image: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf' },
    ]);
});
app.get('/api/crops/:slug', (req, res) => {
    const crop = [
        { slug: 'maize', name: 'Maize', category: 'Cereals', scientificName: 'Zea mays', description: 'High-yield cereal crop well-suited to warm, productive growing systems.', climate: 'Warm temperate to tropical', soilRequirements: 'Well-drained loam', idealPh: '5.8 - 7.0', waterRequirements: 'Moderate to high, especially at flowering', temperature: '18°C - 32°C', growingSeason: '90 - 140 days', image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6', fertilizerRequirements: 'Balanced nitrogen applications at early growth and grain filling', plantingInstructions: 'Prepare ridges and keep moisture consistent during early establishment.', harvestingInfo: 'Harvest when grains reach maturity and moisture drops to acceptable levels.', commonPests: ['Stem borers', 'Fall armyworm'], commonDiseases: ['Leaf blight', 'Rust'], growthStages: ['Germination', 'Vegetative growth', 'Tasseling', 'Grain filling'] },
        { slug: 'tomatoes', name: 'Tomatoes', category: 'Vegetables', scientificName: 'Solanum lycopersicum', description: 'High-value fruiting crop with strong market demand and consistent irrigation needs.', climate: 'Warm and sunny', soilRequirements: 'Deep, fertile, well-drained soil', idealPh: '6.0 - 6.8', waterRequirements: 'Regular moisture with careful irrigation during fruit set', temperature: '18°C - 27°C', growingSeason: '70 - 110 days', image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337', fertilizerRequirements: 'Apply compost and balanced NPK with calcium support', plantingInstructions: 'Transplant healthy seedlings into mulched beds and support with stakes.', harvestingInfo: 'Harvest at breaker or full-ripe stage depending on market needs.', commonPests: ['Fruit worms', 'Whiteflies'], commonDiseases: ['Early blight', 'Late blight'], growthStages: ['Seedling', 'Flowering', 'Fruit set', 'Ripening'] },
        { slug: 'soybeans', name: 'Soybeans', category: 'Legumes', scientificName: 'Glycine max', description: 'Protein-rich legume crop known for nitrogen fixation and rotational value.', climate: 'Warm and humid', soilRequirements: 'Well-drained loam with neutral pH', idealPh: '6.0 - 7.0', waterRequirements: 'Moderate, critical during flowering and pod set', temperature: '20°C - 30°C', growingSeason: '90 - 130 days', image: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf', fertilizerRequirements: 'Aim for low nitrogen and adequate phosphorus and potassium', plantingInstructions: 'Use inoculated seed and maintain even spacing for canopy establishment.', harvestingInfo: 'Harvest when pods are dry and ready to avoid pod shattering.', commonPests: ['Pod borers', 'Leafhoppers'], commonDiseases: ['Rust', 'Frogeye leaf spot'], growthStages: ['Emergence', 'Vegetative growth', 'Flowering', 'Pod set'] },
    ].find((item) => item.slug === req.params.slug);
    if (!crop) {
        return res.status(404).json({ message: 'Crop not found' });
    }
    return res.json(crop);
});
app.get('/api/simulations', (_req, res) => {
    res.json([
        { title: 'Maize yield model', status: 'Optimized', predictedYield: '8.2 t/ha' },
        { title: 'Tomato water stress', status: 'Review', predictedYield: '6.4 t/ha' },
        { title: 'Soybean rotation trial', status: 'Stable', predictedYield: '3.9 t/ha' },
    ]);
});
app.get('/api/profile', authenticate, async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
            email: true,
            firstName: true,
            lastName: true,
            role: true,
        },
    });
    return res.json({
        id: req.user.id,
        email: user?.email,
        name: `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Digital Farm Lab User',
        role: user?.role ?? 'LEARNER',
        location: 'Limpopo, South Africa',
        farmName: 'Green Valley Lab',
    });
});
app.listen(port, () => {
    console.log(`Digital Farm Lab API running on http://localhost:${port}`);
});
