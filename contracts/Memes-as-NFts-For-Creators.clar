(impl-trait .nft-trait.nft-trait)

(define-non-fungible-token meme-nft uint)

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-minted (err u102))
(define-constant err-not-authorized (err u103))
(define-constant err-invalid-price (err u104))
(define-constant err-insufficient-funds (err u105))
(define-constant err-transfer-failed (err u106))

(define-data-var last-token-id uint u0)
(define-data-var marketplace-fee uint u250)
(define-data-var total-memes uint u0)

(define-map meme-data uint {
    title: (string-ascii 100),
    description: (string-ascii 500),
    image-url: (string-ascii 200),
    creator: principal,
    creation-time: uint,
    royalty-percentage: uint,
    viral-score: uint,
    tags: (string-ascii 200)
})

(define-map meme-listings uint {
    price: uint,
    seller: principal,
    listed-at: uint
})

(define-map creator-stats principal {
    total-memes: uint,
    total-earnings: uint,
    followers: uint
})

(define-map meme-ownership-history uint (list 10 {owner: principal, timestamp: uint}))

(define-map meme-likes uint (list 100 principal))

(define-map user-profiles principal {
    username: (string-ascii 50),
    bio: (string-ascii 200),
    joined-at: uint
})

(define-public (mint-meme 
    (title (string-ascii 100))
    (description (string-ascii 500))
    (image-url (string-ascii 200))
    (royalty-percentage uint)
    (tags (string-ascii 200))
    (recipient principal))
    (let (
        (token-id (+ (var-get last-token-id) u1))
        (current-time (unwrap-panic (get-stacks-block-info? time (- stacks-block-height u1))))
    )
    (begin
        (asserts! (<= royalty-percentage u1000) err-invalid-price)
        (try! (nft-mint? meme-nft token-id recipient))
        (map-set meme-data token-id {
            title: title,
            description: description,
            image-url: image-url,
            creator: tx-sender,
            creation-time: current-time,
            royalty-percentage: royalty-percentage,
            viral-score: u0,
            tags: tags
        })
        (map-set meme-ownership-history token-id (list {owner: recipient, timestamp: current-time}))
        (unwrap-panic (update-creator-stats tx-sender u1 u0))
        (var-set last-token-id token-id)
        (var-set total-memes (+ (var-get total-memes) u1))
        (ok token-id)
    ))
)

(define-public (list-meme (token-id uint) (price uint))
    (let (
        (owner (unwrap! (nft-get-owner? meme-nft token-id) err-not-found))
        (listing-time (unwrap-panic (get-stacks-block-info? time (- stacks-block-height u1))))
    )
    (asserts! (is-eq tx-sender owner) err-not-authorized)
    (asserts! (> price u0) err-invalid-price)
    (map-set meme-listings token-id {
        price: price,
        seller: tx-sender,
        listed-at: listing-time
    })
    (ok true)
    )
)

(define-public (unlist-meme (token-id uint))
    (let (
        (owner (unwrap! (nft-get-owner? meme-nft token-id) err-not-found))
    )
    (asserts! (is-eq tx-sender owner) err-not-authorized)
    (map-delete meme-listings token-id)
    (ok true)
    )
)

(define-public (buy-meme (token-id uint))
    (let (
        (listing (unwrap! (map-get? meme-listings token-id) err-not-found))
        (seller (get seller listing))
        (price (get price listing))
        (meme-info (unwrap! (map-get? meme-data token-id) err-not-found))
        (creator (get creator meme-info))
        (royalty-percentage (get royalty-percentage meme-info))
        (marketplace-fee-amount (/ (* price (var-get marketplace-fee)) u10000))
        (royalty-amount (/ (* price royalty-percentage) u10000))
        (seller-amount (- price (+ marketplace-fee-amount royalty-amount)))
        (current-time (unwrap-panic (get-stacks-block-info? time (- stacks-block-height u1))))
    )
    (begin
        (asserts! (not (is-eq tx-sender seller)) err-not-authorized)
        (try! (stx-transfer? price tx-sender seller))
        (try! (stx-transfer? marketplace-fee-amount seller contract-owner))
        (try! (stx-transfer? royalty-amount seller creator))
        (try! (nft-transfer? meme-nft token-id seller tx-sender))
        (map-delete meme-listings token-id)
        (unwrap-panic (update-creator-stats creator u0 royalty-amount))
        (unwrap-panic (update-ownership-history token-id tx-sender current-time))
        (unwrap-panic (increase-viral-score token-id))
        (ok true)
    ))
)

(define-public (like-meme (token-id uint))
    (let (
        (current-likes (default-to (list) (map-get? meme-likes token-id)))
        (user-already-liked (is-some (index-of current-likes tx-sender)))
    )
    (begin
        (asserts! (not user-already-liked) err-not-authorized)
        (asserts! (is-some (map-get? meme-data token-id)) err-not-found)
        (map-set meme-likes token-id (unwrap-panic (as-max-len? (append current-likes tx-sender) u100)))
        (unwrap-panic (increase-viral-score token-id))
        (ok true)
    ))
)

(define-public (create-profile (username (string-ascii 50)) (bio (string-ascii 200)))
    (let (
        (current-time (unwrap-panic (get-stacks-block-info? time (- stacks-block-height u1))))
    )
    (map-set user-profiles tx-sender {
        username: username,
        bio: bio,
        joined-at: current-time
    })
    (ok true)
    )
)

(define-public (follow-creator (creator principal))
    (let (
        (current-stats (default-to {total-memes: u0, total-earnings: u0, followers: u0} 
                        (map-get? creator-stats creator)))
        (new-followers (+ (get followers current-stats) u1))
    )
    (asserts! (not (is-eq tx-sender creator)) err-not-authorized)
    (map-set creator-stats creator {
        total-memes: (get total-memes current-stats),
        total-earnings: (get total-earnings current-stats),
        followers: new-followers
    })
    (ok true)
    )
)

(define-public (transfer (token-id uint) (sender principal) (recipient principal))
    (begin
        (asserts! (is-eq tx-sender sender) err-not-authorized)
        (try! (nft-transfer? meme-nft token-id sender recipient))
        (let (
            (current-time (unwrap-panic (get-stacks-block-info? time (- stacks-block-height u1))))
        )
        (begin
            (unwrap-panic (update-ownership-history token-id recipient current-time))
            (ok true)
        ))
    )
)

(define-public (set-marketplace-fee (new-fee uint))
    (begin
        (asserts! (is-eq tx-sender contract-owner) err-owner-only)
        (asserts! (<= new-fee u1000) err-invalid-price)
        (var-set marketplace-fee new-fee)
        (ok true)
    )
)

(define-read-only (get-last-token-id)
    (ok (var-get last-token-id))
)

(define-read-only (get-token-uri (token-id uint))
    (ok (some (get image-url (unwrap! (map-get? meme-data token-id) err-not-found))))
)

(define-read-only (get-owner (token-id uint))
    (ok (nft-get-owner? meme-nft token-id))
)

(define-read-only (get-meme-data (token-id uint))
    (ok (map-get? meme-data token-id))
)

(define-read-only (get-meme-listing (token-id uint))
    (ok (map-get? meme-listings token-id))
)

(define-read-only (get-creator-stats (creator principal))
    (ok (map-get? creator-stats creator))
)

(define-read-only (get-user-profile (user principal))
    (ok (map-get? user-profiles user))
)

(define-read-only (get-meme-likes (token-id uint))
    (ok (map-get? meme-likes token-id))
)

(define-read-only (get-ownership-history (token-id uint))
    (ok (map-get? meme-ownership-history token-id))
)

(define-read-only (get-total-memes)
    (ok (var-get total-memes))
)

(define-read-only (get-marketplace-fee)
    (ok (var-get marketplace-fee))
)

(define-private (update-creator-stats (creator principal) (meme-count uint) (earnings uint))
    (let (
        (current-stats (default-to {total-memes: u0, total-earnings: u0, followers: u0} 
                        (map-get? creator-stats creator)))
        (new-memes (+ (get total-memes current-stats) meme-count))
        (new-earnings (+ (get total-earnings current-stats) earnings))
    )
    (map-set creator-stats creator {
        total-memes: new-memes,
        total-earnings: new-earnings,
        followers: (get followers current-stats)
    })
    (ok true)
    )
)

(define-private (update-ownership-history (token-id uint) (new-owner principal) (timestamp uint))
    (let (
        (current-history (default-to (list) (map-get? meme-ownership-history token-id)))
        (new-entry {owner: new-owner, timestamp: timestamp})
        (updated-history (unwrap-panic (as-max-len? (append current-history new-entry) u10)))
    )
    (map-set meme-ownership-history token-id updated-history)
    (ok true)
    )
)

(define-private (increase-viral-score (token-id uint))
    (let (
        (current-data (unwrap-panic (map-get? meme-data token-id)))
        (new-score (+ (get viral-score current-data) u1))
    )
    (map-set meme-data token-id (merge current-data {viral-score: new-score}))
    (ok true)
    )
)

